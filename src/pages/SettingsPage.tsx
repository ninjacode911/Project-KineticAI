import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSettingsStore } from '@/stores/settingsStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Activity, ArrowLeft, Monitor, Cpu, Gauge } from 'lucide-react';
import type { ModelPreference } from '@/types/exercise';

const MODEL_OPTIONS: { value: ModelPreference; label: string; description: string }[] = [
  { value: 'lite', label: 'Lite', description: 'Fastest — best for compound movements (squat, push-up)' },
  { value: 'full', label: 'Full', description: 'Balanced — good for rehab and precision exercises' },
  { value: 'heavy', label: 'Heavy', description: 'Most accurate — best for slow movements and yoga' },
];

export function SettingsPage() {
  const navigate = useNavigate();
  const modelVariant = useSettingsStore((s) => s.modelVariant);
  const setModelVariant = useSettingsStore((s) => s.setModelVariant);
  const showAngles = useSettingsStore((s) => s.showAngles);
  const setShowAngles = useSettingsStore((s) => s.setShowAngles);
  const voiceCoaching = useSettingsStore((s) => s.voiceCoaching);
  const setVoiceCoaching = useSettingsStore((s) => s.setVoiceCoaching);
  const cameraDeviceId = useSettingsStore((s) => s.cameraDeviceId);
  const setCameraDeviceId = useSettingsStore((s) => s.setCameraDeviceId);

  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);

  useEffect(() => {
    async function loadCameras() {
      try {
        // Request brief access to enumerate devices with labels
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach((t) => t.stop());
        const devices = await navigator.mediaDevices.enumerateDevices();
        setCameras(devices.filter((d) => d.kind === 'videoinput'));
      } catch {
        // Camera access denied — can still show settings
      }
    }
    loadCameras();
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="border-b px-6 py-4">
        <div className="mx-auto flex max-w-3xl items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Activity className="h-5 w-5 text-primary" />
          <h1 className="text-xl font-bold">Settings</h1>
        </div>
      </header>

      <main className="flex-1 px-6 py-8">
        <div className="mx-auto max-w-3xl space-y-6">
          {/* Model Variant */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Cpu className="h-4 w-4" />
                Pose Model
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {MODEL_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setModelVariant(opt.value)}
                  className={`flex w-full items-center justify-between rounded-lg border p-3 text-left transition-colors ${
                    modelVariant === opt.value
                      ? 'border-primary bg-primary/5'
                      : 'hover:border-muted-foreground/30'
                  }`}
                >
                  <div>
                    <p className="font-medium">{opt.label}</p>
                    <p className="text-sm text-muted-foreground">{opt.description}</p>
                  </div>
                  {modelVariant === opt.value && (
                    <Badge variant="default" className="ml-3">Active</Badge>
                  )}
                </button>
              ))}
            </CardContent>
          </Card>

          {/* Camera Selection */}
          {cameras.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Monitor className="h-4 w-4" />
                  Camera
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {cameras.map((cam) => (
                  <button
                    key={cam.deviceId}
                    onClick={() => setCameraDeviceId(cam.deviceId)}
                    className={`flex w-full items-center justify-between rounded-lg border p-3 text-left transition-colors ${
                      cameraDeviceId === cam.deviceId
                        ? 'border-primary bg-primary/5'
                        : 'hover:border-muted-foreground/30'
                    }`}
                  >
                    <span className="text-sm">{cam.label || `Camera ${cam.deviceId.slice(0, 8)}`}</span>
                    {cameraDeviceId === cam.deviceId && (
                      <Badge variant="default">Active</Badge>
                    )}
                  </button>
                ))}
                <button
                  onClick={() => setCameraDeviceId(null)}
                  className={`flex w-full items-center justify-between rounded-lg border p-3 text-left transition-colors ${
                    cameraDeviceId === null
                      ? 'border-primary bg-primary/5'
                      : 'hover:border-muted-foreground/30'
                  }`}
                >
                  <span className="text-sm">Auto (default)</span>
                  {cameraDeviceId === null && <Badge variant="default">Active</Badge>}
                </button>
              </CardContent>
            </Card>
          )}

          {/* Display */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Gauge className="h-4 w-4" />
                Display
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <label className="flex items-center justify-between">
                <span className="text-sm">Show angle labels on skeleton</span>
                <input
                  type="checkbox"
                  checked={showAngles}
                  onChange={(e) => setShowAngles(e.target.checked)}
                  className="h-4 w-4 rounded accent-primary"
                />
              </label>
              <Separator />
              <label className="flex items-center justify-between">
                <div>
                  <span className="text-sm">Voice coaching</span>
                  <p className="text-xs text-muted-foreground">Speak coaching cues aloud via Web Speech API</p>
                </div>
                <input
                  type="checkbox"
                  checked={voiceCoaching}
                  onChange={(e) => setVoiceCoaching(e.target.checked)}
                  className="h-4 w-4 rounded accent-primary"
                />
              </label>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
