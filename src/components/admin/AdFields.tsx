import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";

export type AdLessonSettings = {
  media_type: string;
  media_path: string | null;
  image_url: string;
  show_after_questions: boolean;
  question_interval: number;
  show_on_hearts_empty: boolean;
  max_per_lesson: number;
  reward_heart: boolean;
};

export const DEFAULT_AD_SETTINGS: AdLessonSettings = {
  media_type: "image",
  media_path: null,
  image_url: "",
  show_after_questions: false,
  question_interval: 5,
  show_on_hearts_empty: false,
  max_per_lesson: 1,
  reward_heart: false,
};

/** Choix d'une image ou d'une vidéo, envoyée automatiquement dans le stockage du site. */
export function AdMediaField<T extends AdLessonSettings>({
  value,
  onChange,
}: {
  value: T;
  onChange: (v: T) => void;
}) {
  const [preview, setPreview] = useState<string | null>(value.image_url || null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    if (value.media_path) {
      void supabase.storage
        .from("ad-media")
        .createSignedUrl(value.media_path, 3600)
        .then(({ data }) => active && data && setPreview(data.signedUrl));
    }
    return () => {
      active = false;
    };
  }, [value.media_path]);

  async function pick(file: File) {
    setErr(null);
    const isVideo = file.type.startsWith("video/");
    if (!isVideo && !file.type.startsWith("image/")) {
      setErr("Choisissez une image ou une vidéo.");
      return;
    }
    setBusy(true);
    setPreview(URL.createObjectURL(file));
    const ext = file.name.split(".").pop() || (isVideo ? "mp4" : "jpg");
    const path = `${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage
      .from("ad-media")
      .upload(path, file, { contentType: file.type });
    setBusy(false);
    if (error) {
      setErr(error.message);
      return;
    }
    onChange({ ...value, media_path: path, media_type: isVideo ? "video" : "image", image_url: "" });
  }

  return (
    <div className="grid gap-1.5">
      <Label>Image ou vidéo</Label>
      <Input
        type="file"
        accept="image/*,video/*"
        disabled={busy}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void pick(f);
        }}
      />
      {busy && <p className="text-xs text-muted-foreground">Envoi en cours…</p>}
      {err && <p className="text-xs text-destructive">{err}</p>}
      {preview &&
        (value.media_type === "video" ? (
          <video src={preview} controls className="max-h-40 rounded-md bg-muted" />
        ) : (
          <img src={preview} alt="Aperçu" className="max-h-40 rounded-md object-contain" />
        ))}
    </div>
  );
}

export function AdLessonFields<T extends AdLessonSettings>({
  value,
  onChange,
  idPrefix,
}: {
  value: T;
  onChange: (v: T) => void;
  idPrefix: string;
}) {
  return (
    <div className="grid gap-3 rounded-lg border border-border p-3">
      <p className="text-sm font-semibold">Pendant les leçons (offre gratuite uniquement)</p>
      <div className="flex flex-wrap items-center gap-3">
        <Switch
          id={`${idPrefix}-q`}
          checked={value.show_after_questions}
          onCheckedChange={(v) => onChange({ ...value, show_after_questions: v })}
        />
        <Label htmlFor={`${idPrefix}-q`}>Afficher toutes les</Label>
        <Input
          type="number"
          min={1}
          max={50}
          className="w-20"
          value={value.question_interval}
          onChange={(e) =>
            onChange({ ...value, question_interval: Math.max(1, Number(e.target.value) || 1) })
          }
        />
        <span className="text-sm">questions</span>
      </div>
      <div className="flex items-center gap-3">
        <Switch
          id={`${idPrefix}-h`}
          checked={value.show_on_hearts_empty}
          onCheckedChange={(v) => onChange({ ...value, show_on_hearts_empty: v })}
        />
        <Label htmlFor={`${idPrefix}-h`}>Afficher quand les cœurs sont épuisés</Label>
      </div>
      {value.show_on_hearts_empty && (
        <div className="flex items-center gap-3 pl-2">
          <Switch
            id={`${idPrefix}-r`}
            checked={value.reward_heart}
            onCheckedChange={(v) => onChange({ ...value, reward_heart: v })}
          />
          <Label htmlFor={`${idPrefix}-r`}>Rendre 1 cœur après visionnage</Label>
        </div>
      )}
      <div className="flex items-center gap-3">
        <Label>Maximum par leçon</Label>
        <Input
          type="number"
          min={0}
          max={50}
          className="w-20"
          value={value.max_per_lesson}
          onChange={(e) =>
            onChange({ ...value, max_per_lesson: Math.max(0, Number(e.target.value) || 0) })
          }
        />
      </div>
    </div>
  );
}
