import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "@/components/common/PageHeader";
import PropertyForm from "@/components/property/PropertyForm";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { getErrorMessage } from "@/lib/errors";
import { createProperty } from "@/services/propertyService";

export default function AddPropertyPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(values, { files }) {
    setSubmitting(true);
    try {
      const created = await createProperty({ userId: user.id, values, files });
      toast.success("Property added");
      navigate(`/properties/${created.id}`, { replace: true });
    } catch (e) {
      toast.error(getErrorMessage(e));
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Add property" description="Fill in the details and add photos." />
      <PropertyForm onSubmit={handleSubmit} submitting={submitting} submitLabel="Save property" />
    </div>
  );
}
