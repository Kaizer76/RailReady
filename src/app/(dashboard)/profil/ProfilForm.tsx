'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const METIERS_OPTIONS = [
  'Conducteur de train',
  'Agent Circulation',
  'Agent Commercial Trains (ASCT)',
  'Contrôleur',
  'Agent Escale',
  'Technicien Maintenance',
  'Agent Voie / Signalisation',
]

const NIVEAUX_ETUDES = [
  'Brevet (3ème)',
  'CAP / BEP',
  'Baccalauréat',
  'BTS / BUT',
  'Licence',
  'Master / Ingénieur',
  'Doctorat',
]

const REGIONS = [
  'Île-de-France', 'Auvergne-Rhône-Alpes', 'Hauts-de-France', 'Grand Est',
  'Nouvelle-Aquitaine', 'Occitanie', 'Provence-Alpes-Côte d\'Azur',
  'Bretagne', 'Pays de la Loire', 'Normandie', 'Bourgogne-Franche-Comté',
  'Centre-Val de Loire', 'Corse', 'Outre-mer',
]

const DISPONIBILITES = [
  'Immédiate',
  '1 mois',
  '2-3 mois',
  '6 mois',
  'Plus d\'un an',
]

interface ProfileData {
  age: number | null
  niveau_etudes: string
  diplome: string
  experience_annees: number | null
  experience_description: string
  metier_vise: string
  region: string
  disponibilite: string
}

interface ProfilFormProps {
  userId: string
  initialData: ProfileData
}

export default function ProfilForm({ userId, initialData }: ProfilFormProps) {
  const [data, setData] = useState<ProfileData>(initialData)
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  function update(field: keyof ProfileData, value: string | number | null) {
    setData(prev => ({ ...prev, [field]: value }))
    setStatus('idle')
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setStatus('saving')

    const supabase = createClient()
    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        age: data.age,
        niveau_etudes: data.niveau_etudes || null,
        diplome: data.diplome || null,
        experience_annees: data.experience_annees,
        experience_description: data.experience_description || null,
        metier_vise: data.metier_vise || null,
        region: data.region || null,
        disponibilite: data.disponibilite || null,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' })

    setStatus(error ? 'error' : 'saved')
    if (!error) setTimeout(() => setStatus('idle'), 3000)
  }

  const inputClass = "w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
  const labelClass = "block text-sm font-medium text-gray-700 mb-1"

  return (
    <form onSubmit={handleSave} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Âge</label>
          <input
            type="number"
            className={inputClass}
            placeholder="Ex: 24"
            min={16} max={65}
            value={data.age ?? ''}
            onChange={e => update('age', e.target.value ? parseInt(e.target.value) : null)}
          />
        </div>
        <div>
          <label className={labelClass}>Région</label>
          <select
            className={inputClass}
            value={data.region}
            onChange={e => update('region', e.target.value)}
          >
            <option value="">Sélectionner...</option>
            {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Niveau d'études</label>
          <select
            className={inputClass}
            value={data.niveau_etudes}
            onChange={e => update('niveau_etudes', e.target.value)}
          >
            <option value="">Sélectionner...</option>
            {NIVEAUX_ETUDES.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
        <div>
          <label className={labelClass}>Diplôme principal</label>
          <input
            type="text"
            className={inputClass}
            placeholder="Ex: Bac Pro MELEC"
            value={data.diplome}
            onChange={e => update('diplome', e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Années d'expérience pro.</label>
          <input
            type="number"
            className={inputClass}
            placeholder="0"
            min={0} max={50}
            value={data.experience_annees ?? ''}
            onChange={e => update('experience_annees', e.target.value ? parseInt(e.target.value) : null)}
          />
        </div>
        <div>
          <label className={labelClass}>Disponibilité</label>
          <select
            className={inputClass}
            value={data.disponibilite}
            onChange={e => update('disponibilite', e.target.value)}
          >
            <option value="">Sélectionner...</option>
            {DISPONIBILITES.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className={labelClass}>Expérience professionnelle (résumé)</label>
        <textarea
          className={`${inputClass} resize-none`}
          rows={2}
          placeholder="Ex: 3 ans conducteur de bus, reconversion vers le ferroviaire..."
          value={data.experience_description}
          onChange={e => update('experience_description', e.target.value)}
          maxLength={300}
        />
      </div>

      <div>
        <label className={labelClass}>Métier ferroviaire visé</label>
        <select
          className={inputClass}
          value={data.metier_vise}
          onChange={e => update('metier_vise', e.target.value)}
        >
          <option value="">Sélectionner un métier...</option>
          {METIERS_OPTIONS.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>

      <div className="flex items-center justify-between pt-2">
        {status === 'saved' && (
          <span className="text-sm text-green-600 font-medium">✓ Profil sauvegardé</span>
        )}
        {status === 'error' && (
          <span className="text-sm text-red-600">Erreur lors de la sauvegarde</span>
        )}
        {(status === 'idle' || status === 'saving') && <span />}

        <button
          type="submit"
          disabled={status === 'saving'}
          className="btn-primary py-2 px-5 disabled:opacity-60"
        >
          {status === 'saving' ? 'Sauvegarde...' : 'Sauvegarder'}
        </button>
      </div>
    </form>
  )
}
