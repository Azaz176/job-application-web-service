import { useState } from 'react';

export default function Form() {
  const [status, setStatus] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Regex patterns
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^[0-9]{10}$/; // 10 digits only

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setSelectedFile(file || null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('');

    const form = e.currentTarget as HTMLFormElement;
    const formData = new FormData(form);

    const fullName = formData.get('fullName') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;
    const file = selectedFile; 

    // Client-side validations
    if (!fullName.trim()) {
      return setStatus('Full Name is required.');
    }
    if (!emailRegex.test(email)) {
      return setStatus('Invalid email address.');
    }
    if (!phoneRegex.test(phone)) {
      return setStatus('Phone number must be 10 digits.');
    }
    if (!file) {
      return setStatus('Resume file is required.');
    }
    if (!['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type)) {
      return setStatus('Only PDF or DOCX files are allowed.');
    }
    if (file.size > 5 * 1024 * 1024) {
      return setStatus('File size should not exceed 5MB.');
    }

    // Add file to formData
    formData.set('resume', file);

    // Submit if validation passes
    setStatus('Submitting...');
    try {
      const res = await fetch('/api/apply', {
        method: 'POST',
        body: formData,
      });

      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error('Invalid server response: ' + text);
      }

      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      setStatus(data.message || 'Application submitted successfully!');
      form.reset();
      setSelectedFile(null); // Reset file state
    } catch (err: any) {
      setStatus(`Error: ${err.message}`);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-lg mx-auto mt-10 p-6 bg-white shadow-md rounded-lg space-y-4"
    >
      <h1 className="text-2xl font-bold text-center">Job Application</h1>

      <input
        name="fullName"
        placeholder="Full Name"
        required
        className="border border-gray-300 p-2 w-full rounded"
      />

      <input
        name="email"
        type="email"
        placeholder="Email"
        required
        className="border border-gray-300 p-2 w-full rounded"
      />

      <input
        name="phone"
        placeholder="Phone"
        required
        className="border border-gray-300 p-2 w-full rounded"
      />

      <input
        name="linkedin"
        placeholder="LinkedIn Profile (optional)"
        className="border border-gray-300 p-2 w-full rounded"
      />

      {/* STYLED FILE INPUT */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Resume (PDF or DOCX, max 5MB)
        </label>
        <div className="flex items-center space-x-3">
          <label className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors text-sm font-medium">
            Choose File
            <input
              type="file"
              accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              className="hidden"
              onChange={handleFileChange}
              required
            />
          </label>
          <span className="text-gray-600 text-sm flex-1">
            {selectedFile ? (
              <span className="text-green-600">
                ✓ {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
              </span>
            ) : (
              "No file chosen"
            )}
          </span>
        </div>
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 text-white font-semibold py-2 rounded hover:bg-blue-700"
      >
        Submit
      </button>

      <p className="text-center text-red-500">{status}</p>
    </form>
  );
}