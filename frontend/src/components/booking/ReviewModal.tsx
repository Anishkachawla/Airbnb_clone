"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Spinner } from "@/components/ui/Spinner";
import { StarInput } from "@/components/ui/StarInput";
import { useToast } from "@/context/ToastContext";
import { api } from "@/lib/api";
import type { Booking } from "@/lib/types";

const LABELS = ["", "Terrible", "Poor", "Okay", "Good", "Amazing"];

export function ReviewModal({ booking, onClose, onDone }: { booking: Booking | null; onClose: () => void; onDone: (bookingId: number) => void }) {
  const toast = useToast();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit() {
    if (!booking) return;
    setSaving(true);
    try {
      await api.reviews.create({ booking_id: booking.id, rating, comment });
      toast.show("Thanks! Your review is posted");
      onDone(booking.id);
      setRating(0);
      setComment("");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={!!booking}
      onClose={onClose}
      title="Write a review"
      footer={
        <div className="flex justify-end">
          <button onClick={submit} disabled={!rating || comment.trim().length < 3 || saving} className="btn-dark">
            {saving ? <Spinner /> : "Post review"}
          </button>
        </div>
      }
    >
      <div className="space-y-6 p-6">
        <div>
          <h3 className="text-[22px] font-semibold">How was your stay at {booking?.listing.title}?</h3>
          <p className="text-muted">Your review will appear on the listing page.</p>
        </div>
        <div className="flex items-center gap-4">
          <StarInput value={rating} onChange={setRating} />
          <span className="font-semibold">{LABELS[rating]}</span>
        </div>
        <label className="block">
          <span className="mb-2 block font-semibold">Tell future guests what you loved</span>
          <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={5} maxLength={2000} className="field resize-none" placeholder="The view, the host, the bed…" />
          <span className="mt-1 block text-right text-xs text-muted">{comment.length}/2000</span>
        </label>
      </div>
    </Modal>
  );
}
