"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { MinimalHeader } from "@/components/layout/MinimalHeader";
import { Counter } from "@/components/ui/Counter";
import { Icon, type IconName } from "@/components/ui/Icon";
import { RequireUser } from "@/components/ui/RequireUser";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/context/ToastContext";
import { api } from "@/lib/api";
import { CATEGORIES, PROPERTY_TYPES } from "@/lib/constants";
import { price } from "@/lib/format";
import type { Amenity, ListingInput } from "@/lib/types";
import { LocationPicker } from "./LocationPicker";
import { PhotoManager } from "./PhotoManager";

const EMPTY: ListingInput = {
  title: "", description: "", property_type: "", category: "", address: "", city: "", state: "", country: "India",
  latitude: 20.6, longitude: 78.9, price_per_night: 5000, cleaning_fee: 500, max_guests: 4, bedrooms: 1, beds: 1,
  bathrooms: 1, min_nights: 1, image_urls: [], amenity_ids: [],
};

interface Step {
  title: string;
  subtitle?: string;
  /** Returns an error message if the step isn't complete. */
  validate: (f: ListingInput) => string | null;
  render: () => ReactNode;
}

export function ListingWizard({ listingId }: { listingId?: number }) {
  return (
    <RequireUser title="Create a listing" body="Log in as a host to list your place.">
      {(user) =>
        user.is_host ? <Wizard listingId={listingId} /> : (
          <>
            <MinimalHeader />
            <div className="mx-auto max-w-xl px-6 py-24">
              <h1 className="mb-4 text-[32px] font-semibold">Switch to a host account first</h1>
              <Link href="/hosting" className="btn-brand inline-block">Start hosting</Link>
            </div>
          </>
        )
      }
    </RequireUser>
  );
}

function Wizard({ listingId }: { listingId?: number }) {
  const router = useRouter();
  const toast = useToast();
  const editing = listingId !== undefined;
  const [form, setForm] = useState<ListingInput>(EMPTY);
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [step, setStep] = useState(0);
  const [loaded, setLoaded] = useState(!editing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.meta().then((m) => setAmenities(m.amenities)).catch(() => {});
    if (!editing) return;
    api.listings
      .get(listingId)
      .then((l) => {
        setForm({
          title: l.title, description: l.description, property_type: l.property_type, category: l.category,
          address: l.address ?? "", city: l.city, state: l.state ?? "", country: l.country, latitude: l.latitude,
          longitude: l.longitude, price_per_night: l.price_per_night, cleaning_fee: l.cleaning_fee, max_guests: l.max_guests,
          bedrooms: l.bedrooms, beds: l.beds, bathrooms: l.bathrooms, min_nights: l.min_nights,
          image_urls: l.images.map((i) => i.url), amenity_ids: l.amenities.map((a) => a.id),
        });
        setLoaded(true);
      })
      .catch((e: Error) => toast.error(e.message));
  }, [editing, listingId, toast]);

  const set = <K extends keyof ListingInput>(key: K, value: ListingInput[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setError(null);
  };

  const tile = (selected: boolean, onClick: () => void, icon: IconName, label: string) => (
    <button key={label} type="button" onClick={onClick} aria-pressed={selected}
      className={`flex flex-col items-start gap-3 rounded-xl border p-4 text-left transition ${selected ? "border-2 border-ink bg-soft" : "border-line hover:border-ink"}`}>
      <Icon name={icon} size={32} strokeWidth={1.4} />
      <span className="font-semibold">{label}</span>
    </button>
  );

  const steps: Step[] = [
    {
      title: "Which of these best describes your place?",
      validate: (f) => (f.property_type ? null : "Choose a property type"),
      render: () => (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {PROPERTY_TYPES.map((t) => tile(form.property_type === t.key, () => set("property_type", t.key), t.icon, t.label))}
        </div>
      ),
    },
    {
      title: "Which category fits it best?",
      subtitle: "Guests browse by these categories on the home page.",
      validate: (f) => (f.category ? null : "Choose a category"),
      render: () => (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {CATEGORIES.map((c) => tile(form.category === c.key, () => set("category", c.key), c.icon, c.label))}
        </div>
      ),
    },
    {
      title: "Where's your place located?",
      subtitle: "Your address is only shared with guests after they've made a reservation. Click the map to drop the pin.",
      validate: (f) => (!f.city.trim() ? "Add a city" : !f.country.trim() ? "Add a country" : f.latitude === EMPTY.latitude && f.longitude === EMPTY.longitude ? "Click the map to place your pin" : null),
      render: () => (
        <div className="space-y-4">
          <input className="field" placeholder="Street address (optional)" value={form.address ?? ""} onChange={(e) => set("address", e.target.value)} />
          <div className="grid gap-4 sm:grid-cols-3">
            <input className="field" placeholder="City" value={form.city} onChange={(e) => set("city", e.target.value)} />
            <input className="field" placeholder="State / region" value={form.state ?? ""} onChange={(e) => set("state", e.target.value)} />
            <input className="field" placeholder="Country" value={form.country} onChange={(e) => set("country", e.target.value)} />
          </div>
          <LocationPicker lat={form.latitude} lng={form.longitude} onChange={(lat, lng) => setForm((f) => ({ ...f, latitude: lat, longitude: lng }))} />
          <p className="text-sm text-muted">Pin: {form.latitude.toFixed(4)}, {form.longitude.toFixed(4)}</p>
        </div>
      ),
    },
    {
      title: "Share some basics about your place",
      subtitle: "You'll add more details later, like bed types.",
      validate: () => null,
      render: () => (
        <div className="divide-y divide-line">
          <Counter label="Guests" value={form.max_guests} onChange={(v) => set("max_guests", v)} min={1} max={16} />
          <Counter label="Bedrooms" value={form.bedrooms} onChange={(v) => set("bedrooms", v)} min={0} max={20} />
          <Counter label="Beds" value={form.beds} onChange={(v) => set("beds", v)} min={1} max={30} />
          <Counter label="Bathrooms" value={form.bathrooms} onChange={(v) => set("bathrooms", v)} min={0.5} max={20} step={0.5} />
          <Counter label="Minimum nights" hint="Shortest stay you'll accept" value={form.min_nights} onChange={(v) => set("min_nights", v)} min={1} max={30} />
        </div>
      ),
    },
    {
      title: "Tell guests what your place has to offer",
      subtitle: "You can add more amenities after you publish.",
      validate: () => null,
      render: () => (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {amenities.map((a) => {
            const on = form.amenity_ids.includes(a.id);
            return tile(on, () => set("amenity_ids", on ? form.amenity_ids.filter((x) => x !== a.id) : [...form.amenity_ids, a.id]), a.icon as IconName, a.name);
          })}
        </div>
      ),
    },
    {
      title: "Add some photos of your place",
      subtitle: "You'll need at least one photo to publish.",
      validate: (f) => (f.image_urls.length ? null : "Add at least one photo"),
      render: () => <PhotoManager urls={form.image_urls} onChange={(urls) => set("image_urls", urls)} />,
    },
    {
      title: "Now, let's give your place a title and description",
      subtitle: "Short titles work best. Have fun with it — you can always change it later.",
      validate: (f) => (f.title.trim().length < 3 ? "Title needs at least 3 characters" : f.description.trim().length < 10 ? "Description needs at least 10 characters" : null),
      render: () => (
        <div className="space-y-6">
          <label className="block">
            <span className="mb-2 block font-semibold">Title</span>
            <textarea rows={2} maxLength={120} className="field resize-none text-xl" value={form.title} onChange={(e) => set("title", e.target.value)} />
            <span className="mt-1 block text-sm text-muted">{form.title.length}/120</span>
          </label>
          <label className="block">
            <span className="mb-2 block font-semibold">Description</span>
            <textarea rows={7} maxLength={2000} className="field resize-none" value={form.description} onChange={(e) => set("description", e.target.value)}
              placeholder="You'll have a great time at this comfortable place to stay." />
            <span className="mt-1 block text-sm text-muted">{form.description.length}/2000</span>
          </label>
        </div>
      ),
    },
    {
      title: "Now, set your price",
      subtitle: "You can change it anytime.",
      validate: (f) => (f.price_per_night < 1 ? "Set a nightly price" : null),
      render: () => {
        const serviceFee = Math.round(form.price_per_night * 0.14);
        return (
          <div>
            <label className="flex items-center justify-center text-[64px] font-bold tracking-tight md:text-[96px]">
              <span>₹</span>
              <input inputMode="numeric" aria-label="Price per night" value={form.price_per_night || ""}
                onChange={(e) => set("price_per_night", Math.min(100000, Number(e.target.value.replace(/\D/g, "")) || 0))}
                className="w-[5.5ch] bg-transparent text-center outline-none" />
            </label>
            <p className="mb-8 text-center text-muted">per night</p>
            <div className="mx-auto max-w-sm space-y-3 rounded-xl border border-line p-6">
              <label className="flex items-center justify-between">
                <span>Cleaning fee</span>
                <span className="flex items-center rounded-lg border border-line px-3 py-1.5">₹
                  <input inputMode="numeric" value={form.cleaning_fee} onChange={(e) => set("cleaning_fee", Math.min(10000, Number(e.target.value.replace(/\D/g, "")) || 0))} className="w-20 bg-transparent text-right outline-none" />
                </span>
              </label>
              <div className="flex justify-between text-muted"><span>Guest service fee (est.)</span><span>{price(serviceFee)}</span></div>
              <hr className="border-line" />
              <div className="flex justify-between font-semibold"><span>Guest price per night</span><span>{price(form.price_per_night + serviceFee)}</span></div>
              <div className="flex justify-between font-semibold"><span>You earn</span><span>{price(form.price_per_night)}</span></div>
            </div>
          </div>
        );
      },
    },
  ];

  const current = steps[step];
  const last = step === steps.length - 1;

  async function save() {
    const firstInvalid = steps.findIndex((s) => s.validate(form));
    if (firstInvalid >= 0) {
      setStep(firstInvalid);
      setError(steps[firstInvalid].validate(form));
      return;
    }
    setSaving(true);
    const payload: ListingInput = { ...form, address: form.address?.trim() || null, state: form.state?.trim() || null, title: form.title.trim(), description: form.description.trim() };
    try {
      const saved = editing ? await api.listings.update(listingId, payload) : await api.listings.create(payload);
      toast.show(editing ? "Changes saved" : "Your listing is published", { image: form.image_urls[0], action: { label: "View", href: `/rooms/${saved.id}` } });
      router.push("/hosting?tab=listings");
    } catch (e) {
      toast.error((e as Error).message);
      setSaving(false);
    }
  }

  function next() {
    const err = current.validate(form);
    if (err) return setError(err);
    if (last) return save();
    setStep(step + 1);
    window.scrollTo({ top: 0 });
  }

  return (
    <div className="flex min-h-screen flex-col">
      <MinimalHeader
        right={
          <div className="flex gap-2">
            <Link href="/hosting?tab=listings" className="rounded-full border border-line px-4 py-2 text-sm font-semibold hover:border-ink">Exit</Link>
            {editing && <button onClick={save} disabled={saving} className="rounded-full border border-line px-4 py-2 text-sm font-semibold hover:border-ink">Save & exit</button>}
          </div>
        }
      />
      {!loaded ? (
        <div className="flex flex-1 items-center justify-center"><Spinner /></div>
      ) : (
        <main className="mx-auto w-full max-w-[640px] flex-1 px-6 pb-40 pt-10">
          {editing && (
            <div className="no-scrollbar mb-8 flex gap-2 overflow-x-auto">
              {steps.map((s, i) => (
                <button key={s.title} onClick={() => setStep(i)} className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold ${i === step ? "border-ink bg-ink text-surface" : "border-line"}`}>
                  {["Type", "Category", "Location", "Basics", "Amenities", "Photos", "Title", "Price"][i]}
                </button>
              ))}
            </div>
          )}
          <h1 className="mb-2 text-[26px] font-semibold leading-tight md:text-[32px]">{current.title}</h1>
          {current.subtitle && <p className="mb-8 text-lg text-muted">{current.subtitle}</p>}
          {!current.subtitle && <div className="mb-8" />}
          {current.render()}
          {error && <p role="alert" className="mt-6 flex items-center gap-2 font-semibold text-rausch-dark"><Icon name="flag" size={16} /> {error}</p>}
        </main>
      )}

      <footer className="fixed inset-x-0 bottom-0 bg-surface">
        <div className="flex h-1.5 gap-1.5 bg-surface">
          {steps.map((_, i) => (
            <span key={i} className="h-full flex-1 bg-line">
              <span className="block h-full bg-ink transition-[width] duration-500" style={{ width: i <= step ? "100%" : "0%" }} />
            </span>
          ))}
        </div>
        <div className="mx-auto flex max-w-page items-center justify-between px-6 py-4 xl:px-10">
          <button onClick={() => (step ? setStep(step - 1) : router.push("/hosting?tab=listings"))} className="link-underline rounded-lg px-2 py-2 hover:bg-soft">Back</button>
          <button onClick={next} disabled={saving || !loaded} className={last ? "btn-brand" : "btn-dark"}>
            {saving ? <Spinner /> : last ? (editing ? "Save changes" : "Publish") : "Next"}
          </button>
        </div>
      </footer>
    </div>
  );
}
