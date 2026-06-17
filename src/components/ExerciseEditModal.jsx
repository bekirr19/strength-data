import { Pencil, Trash2 } from 'lucide-react';
import { MUSCLE_OPTIONS, EXERCISE_CATEGORY_META } from '../utils/exerciseMetadata';
import { Modal } from '../ds/components/feedback/Modal';
import { Input } from '../ds/components/forms/Input';
import { FilterChip } from '../ds/components/forms/FilterChip';
import { Button } from '../ds/components/buttons/Button';

const CATEGORY_KEYS = ['push', 'pull', 'leg', 'other'];
const CATEGORY_ACCENT = { push: 'var(--push-500)', pull: 'var(--pull-500)', leg: 'var(--leg-500)', other: 'var(--other-500)' };
const WEIGHT_STEPS = [1, 2.5, 5, 6, 10];

const Label = ({ children }) => (
  <div style={{ fontSize: 'var(--text-2xs)', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{children}</div>
);

/**
 * Controlled exercise create/edit modal. Parent owns the form state.
 * Props: isOpen, title, form:{ name, category, muscles, weightStep },
 *        onChange(partial), onClose(), onSave(), onDelete?, isSaving, saveLabel
 */
export default function ExerciseEditModal({
  isOpen,
  title = 'Edit exercise',
  form,
  onChange,
  onClose,
  onSave,
  onDelete,
  isSaving = false,
  saveLabel = 'Save',
}) {
  if (!isOpen || !form) return null;

  const muscles = Array.isArray(form.muscles) ? form.muscles : [];
  const toggleMuscle = (key) => {
    const exists = muscles.includes(key);
    onChange({ muscles: exists ? muscles.filter((m) => m !== key) : [...muscles, key] });
  };

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      variant="sheet"
      contained={false}
      eyebrow={onDelete ? 'Edit exercise' : 'New exercise'}
      title={title}
      footer={
        <div style={{ display: 'flex', gap: 10 }}>
          {onDelete && (
            <Button variant="danger" onClick={onDelete} disabled={isSaving} icon={<Trash2 size={16} />} style={{ flex: '0 0 auto' }}>Delete</Button>
          )}
          <Button variant="secondary" fullWidth onClick={onClose} disabled={isSaving}>Cancel</Button>
          <Button variant="primary" fullWidth onClick={onSave} disabled={isSaving}>{isSaving ? 'Saving…' : saveLabel}</Button>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, paddingBottom: 4 }}>
        <div>
          <Label>Exercise name</Label>
          <Input icon={<Pencil size={18} />} value={form.name || ''} onChange={(e) => onChange({ name: e.target.value })} placeholder="e.g. Incline Bench Press" />
        </div>

        <div>
          <Label>Category</Label>
          <div style={{ display: 'flex', gap: 8 }}>
            {CATEGORY_KEYS.map((key) => (
              <FilterChip
                key={key}
                label={EXERCISE_CATEGORY_META[key]?.label || key}
                active={(form.category || 'other') === key}
                accent={CATEGORY_ACCENT[key]}
                onClick={() => onChange({ category: key })}
                style={{ flex: 1, justifyContent: 'center' }}
              />
            ))}
          </div>
        </div>

        <div>
          <Label>Target muscles</Label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {MUSCLE_OPTIONS.map((option) => (
              <FilterChip key={option.key} label={option.label} size="sm" active={muscles.includes(option.key)} onClick={() => toggleMuscle(option.key)} />
            ))}
          </div>
        </div>

        <div>
          <Label>Weight increment</Label>
          <div style={{ display: 'flex', gap: 8 }}>
            {WEIGHT_STEPS.map((step) => (
              <FilterChip key={step} label={`${step}`} active={form.weightStep === step} onClick={() => onChange({ weightStep: step })} style={{ flex: 1, justifyContent: 'center' }} />
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}
