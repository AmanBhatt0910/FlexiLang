'use client';
import { useState } from 'react';
import CodeEditor from '@/components/CodeEditor';
import axios from '@/utils/axiosInstance';

const languages = ['javascript', 'python', 'java', 'cpp'];

export default function TranslatePage() {
  const [sourceLang, setSourceLang] = useState('javascript');
  const [targetLang, setTargetLang] = useState('python');
  const [inputCode, setInputCode] = useState('');
  const [outputCode, setOutputCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTranslate = async () => {
    try {
      setLoading(true);
      const res = await axios.post('/translate', { inputCode, sourceLang, targetLang });
      setOutputCode(res.data.translatedCode);
    } catch (err) {
      alert('Translation failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-center">🔁 Code Translator</h1>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 space-y-2">
          <label className="font-semibold">From Language</label>
          <select
            className="select select-bordered w-full"
            value={sourceLang}
            onChange={(e) => setSourceLang(e.target.value)}
          >
            {languages.map((lang) => (
              <option key={lang} value={lang}>{lang}</option>
            ))}
          </select>
          <CodeEditor code={inputCode} setCode={setInputCode} language={sourceLang} placeholder="Write your code..." />
        </div>

        <div className="flex-1 space-y-2">
          <label className="font-semibold">To Language</label>
          <select
            className="select select-bordered w-full"
            value={targetLang}
            onChange={(e) => setTargetLang(e.target.value)}
          >
            {languages.map((lang) => (
              <option key={lang} value={lang}>{lang}</option>
            ))}
          </select>
          <CodeEditor code={outputCode} setCode={() => {}} language={targetLang} placeholder="Translated code..." />
        </div>
      </div>

      <div className="text-center">
        <button
          onClick={handleTranslate}
          className="btn btn-primary px-6 py-2 rounded"
          disabled={loading}
        >
          {loading ? 'Translating...' : 'Translate'}
        </button>
      </div>
    </div>
  );
}
