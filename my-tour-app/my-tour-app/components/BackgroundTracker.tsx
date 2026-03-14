'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useTourLogic } from '@/hooks/useTourLogic';
import { useOfflineStorage } from '@/hooks/useOfflineStorage';

interface Location {
  id: string; name: string; lat: number; lng: number;
  radius: number; prompt: string; description: string;
}

interface Props {
  isTracking: boolean; isMuted: boolean; isOnline: boolean;
  onLocationUpdate: (loc: { lat: number; lng: number }) => void;
  onNewMessage: (msg: string, isAi: boolean) => void;
  onLocationVisited?: () => void;
}

export default function BackgroundTracker({ isTracking, isMuted, isOnline, onLocationUpdate, onNewMessage, onLocationVisited }: Props) {
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const visitedLocations = useRef<Set<string>>(new Set());
  const processingRef = useRef(false);
  const locationsRef = useRef<Location[]>([]);
  const { calculateDistance } = useTourLogic();
  const { getData } = useOfflineStorage();

  useEffect(() => {
    const loadLocations = async () => {
      try {
        if (isOnline) {
          const res = await fetch('/api/locations');
          locationsRef.current = await res.json();
        } else {
          const cached = await getData<Location[]>('locations');
          if (cached) locationsRef.current = cached;
        }
      } catch {
        const cached = await getData<Location[]>('locations');
        if (cached) locationsRef.current = cached;
      }
    };
    loadLocations();
  }, [isOnline, getData]);

  const speakText = useCallback((text: string) => {
    if (isMuted || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'vi-VN';
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  }, [isMuted]);

  const checkProximity = useCallback(async (lat: number, lng: number) => {
    if (processingRef.current) return;
    for (const loc of locationsRef.current) {
      const distance = calculateDistance(lat, lng, loc.lat, loc.lng);
      if (distance < loc.radius && !visitedLocations.current.has(loc.id)) {
        visitedLocations.current.add(loc.id);
        processingRef.current = true;
        try {
          onNewMessage(`📍 Đã đến **${loc.name}**!`, false);
          onLocationVisited?.();
          const userId = localStorage.getItem('tour_user_id');
          if (isOnline) {
            const res = await fetch('/api/chat', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId, contextPrompt: loc.prompt, locationName: loc.name }),
            });
            if (res.ok) {
              const data = await res.json();
              onNewMessage(data.reply, true);
              speakText(data.reply);
            } else {
              onNewMessage(loc.description || 'Không có thông tin offline.', true);
              speakText(loc.description || '');
            }
          } else {
            onNewMessage(`📴 [Offline] ${loc.description}`, true);
            speakText(loc.description || '');
          }
        } catch {
          onNewMessage(loc.description || '❌ Lỗi kết nối', true);
        } finally {
          processingRef.current = false;
        }
        break;
      }
    }
  }, [calculateDistance, isOnline, onNewMessage, onLocationVisited, speakText]);

  useEffect(() => {
    if (isTracking) {
      if ('wakeLock' in navigator) {
        (navigator as any).wakeLock.request('screen').then((lock: WakeLockSentinel) => {
          wakeLockRef.current = lock;
        }).catch(console.error);
      }
      if ('geolocation' in navigator) {
        watchIdRef.current = navigator.geolocation.watchPosition(
          (pos) => {
            onLocationUpdate({ lat: pos.coords.latitude, lng: pos.coords.longitude });
            checkProximity(pos.coords.latitude, pos.coords.longitude);
          },
          (err) => onNewMessage(`⚠️ GPS: ${err.message}`, false),
          { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 }
        );
      }
    } else {
      if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
      wakeLockRef.current?.release();
      window.speechSynthesis?.cancel();
    }
    return () => {
      if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
      wakeLockRef.current?.release();
    };
  }, [isTracking, onLocationUpdate, checkProximity, onNewMessage]);

  return null;
}
