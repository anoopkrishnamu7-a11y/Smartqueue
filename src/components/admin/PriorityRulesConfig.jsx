import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShieldAlert,
  Save,
  CheckCircle2,
  Clock,
  Sparkles,
  Users
} from 'lucide-react';

export default function PriorityRulesConfig() {
  const { priorityRules, updatePriorityRules } = useApp();

  const [rules, setRules] = useState({
    enablePriorityQueue: priorityRules?.enablePriorityQueue ?? true,
    seniorCitizenPriority: priorityRules?.seniorCitizenPriority ?? true,
    disabilityPriority: priorityRules?.disabilityPriority ?? true,
    emergencyTriagePriority: priorityRules?.emergencyTriagePriority ?? true,
    vipPriority: priorityRules?.vipPriority ?? true,
    maxWaitThresholdMins: priorityRules?.maxWaitThresholdMins ?? 30,
    ratioNormalToPriority: priorityRules?.ratioNormalToPriority ?? '2:1'
  });

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleToggle = (key) => {
    setRules(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updatePriorityRules(rules);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm max-w-3xl">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-6">
        <div>
          <h3 className="text-base font-black text-slate-900 dark:text-slate-100">
            Priority Queue & Scheduling Engine
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Configure automated token sequencing algorithms and fairness thresholds.
          </p>
        </div>

        {savedSuccess && (
          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2.5 py-1 rounded-full flex items-center space-x-1 animate-fade-in">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Rules Updated!</span>
          </span>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Master Toggle */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-brand-50/50 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-800">
          <div>
            <h4 className="font-bold text-sm text-brand-900 dark:text-brand-200">
              Enable Intelligent Priority Routing
            </h4>
            <p className="text-xs text-brand-700/80 dark:text-brand-300/80">
              When active, elderly citizens, pregnant mothers, and urgent triage patients jump ahead fairly.
            </p>
          </div>
          <input
            type="checkbox"
            checked={rules.enablePriorityQueue}
            onChange={() => handleToggle('enablePriorityQueue')}
            className="w-5 h-5 accent-brand-600 rounded cursor-pointer"
          />
        </div>

        {/* Priority Groups Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h5 className="font-bold text-xs text-slate-900 dark:text-slate-100">
                Senior Citizen (60+ yrs)
              </h5>
              <p className="text-[11px] text-slate-400">Automatic expedited turn order</p>
            </div>
            <input
              type="checkbox"
              checked={rules.seniorCitizenPriority}
              onChange={() => handleToggle('seniorCitizenPriority')}
              className="w-4 h-4 accent-brand-600 rounded cursor-pointer"
            />
          </div>

          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h5 className="font-bold text-xs text-slate-900 dark:text-slate-100">
                Disability & Special Care
              </h5>
              <p className="text-[11px] text-slate-400">Wheelchair and assistance priority</p>
            </div>
            <input
              type="checkbox"
              checked={rules.disabilityPriority}
              onChange={() => handleToggle('disabilityPriority')}
              className="w-4 h-4 accent-brand-600 rounded cursor-pointer"
            />
          </div>

          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h5 className="font-bold text-xs text-slate-900 dark:text-slate-100">
                Emergency & Medical Triage
              </h5>
              <p className="text-[11px] text-slate-400">Immediate front-of-line escalation</p>
            </div>
            <input
              type="checkbox"
              checked={rules.emergencyTriagePriority}
              onChange={() => handleToggle('emergencyTriagePriority')}
              className="w-4 h-4 accent-brand-600 rounded cursor-pointer"
            />
          </div>

          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h5 className="font-bold text-xs text-slate-900 dark:text-slate-100">
                VIP / Premier Account Holders
              </h5>
              <p className="text-[11px] text-slate-400">Dedicated VIP token sequencing</p>
            </div>
            <input
              type="checkbox"
              checked={rules.vipPriority}
              onChange={() => handleToggle('vipPriority')}
              className="w-4 h-4 accent-brand-600 rounded cursor-pointer"
            />
          </div>

        </div>

        {/* Threshold Settings */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              Max Wait Threshold (Auto-Escalation)
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                min={5}
                max={120}
                value={rules.maxWaitThresholdMins}
                onChange={(e) => setRules({ ...rules, maxWaitThresholdMins: Number(e.target.value) })}
                className="w-24 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono font-bold outline-none"
              />
              <span className="text-xs text-slate-500">minutes</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              If any customer waits longer than this, their token escalates to priority status automatically.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              Call Ratio (Normal : Priority)
            </label>
            <select
              value={rules.ratioNormalToPriority}
              onChange={(e) => setRules({ ...rules, ratioNormalToPriority: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold outline-none"
            >
              <option value="2:1">2 Priority : 1 Normal (Balanced)</option>
              <option value="1:1">1 Priority : 1 Normal (Equal Alternating)</option>
              <option value="3:1">3 Priority : 1 Normal (Priority Heavy)</option>
              <option value="strict">Strict Priority First</option>
            </select>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="py-2.5 px-6 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-600/20 transition-all flex items-center space-x-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? 'Saving Changes...' : 'Save Rule Configuration'}</span>
          </button>
        </div>

      </form>
    </div>
  );
}
