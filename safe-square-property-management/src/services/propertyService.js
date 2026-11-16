import { supabase } from "@/lib/supabaseClient";
import { deleteImagesByUrls, uploadImages } from "@/services/storageService";

const TABLE = "properties";

/** Form (camelCase) -> database (snake_case) */
export function toDbPayload(v) {
  return {
    title: v.title.trim(),
    property_type: v.propertyType,
    status: v.status,
    price: Number(v.price) || 0,
    area: Number(v.area) || 0,
    location: v.location.trim(),
    address: v.address.trim(),
    description: (v.description || "").trim(),
    owner_name: v.ownerName.trim(),
    owner_phone: (v.ownerPhone || "").trim(),
    notes: (v.notes || "").trim(),
    follow_up_date: v.followUpDate || null,
  };
}

/** Database row -> form default values */
export function toFormValues(p) {
  return {
    title: p.title ?? "",
    propertyType: p.property_type ?? "House",
    status: p.status ?? "Available",
    price: p.price ?? "",
    area: p.area ?? "",
    location: p.location ?? "",
    address: p.address ?? "",
    description: p.description ?? "",
    ownerName: p.owner_name ?? "",
    ownerPhone: p.owner_phone ?? "",
    notes: p.notes ?? "",
    followUpDate: p.follow_up_date ?? "",
  };
}

export async function fetchProperties() {
  const { data, error } = await supabase.from(TABLE).select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function fetchPropertyById(id) {
  const { data, error } = await supabase.from(TABLE).select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data;
}

export async function fetchDashboardData() {
  const count = (status) => {
    let q = supabase.from(TABLE).select("id", { count: "exact", head: true });
    if (status) q = q.eq("status", status);
    return q;
  };
  const [total, available, sold, rented, recent] = await Promise.all([
    count(),
    count("Available"),
    count("Sold"),
    count("Rented"),
    supabase.from(TABLE).select("*").order("created_at", { ascending: false }).limit(5),
  ]);
  const failed = [total, available, sold, rented, recent].find((r) => r.error);
  if (failed) throw failed.error;

  return {
    stats: { total: total.count ?? 0, available: available.count ?? 0, sold: sold.count ?? 0, rented: rented.count ?? 0 },
    recent: recent.data ?? [],
  };
}

export async function createProperty({ userId, values, files }) {
  const id = crypto.randomUUID(); // known up-front so images can live in a per-property folder
  const uploaded = await uploadImages({ userId, propertyId: id, files });
  const { data, error } = await supabase
    .from(TABLE)
    .insert({ id, ...toDbPayload(values), images: uploaded })
    .select()
    .single();
  if (error) {
    await deleteImagesByUrls(uploaded);
    throw error;
  }
  return data;
}

export async function updateProperty({ userId, property, values, keptImages, files }) {
  const uploaded = await uploadImages({ userId, propertyId: property.id, files });
  const { data, error } = await supabase
    .from(TABLE)
    .update({ ...toDbPayload(values), images: [...keptImages, ...uploaded] })
    .eq("id", property.id)
    .select()
    .single();
  if (error) {
    await deleteImagesByUrls(uploaded);
    throw error;
  }
  const removed = (property.images || []).filter((url) => !keptImages.includes(url));
  await deleteImagesByUrls(removed);
  return data;
}

export async function deleteProperty(property) {
  const { error } = await supabase.from(TABLE).delete().eq("id", property.id);
  if (error) throw error;
  await deleteImagesByUrls(property.images || []);
}
