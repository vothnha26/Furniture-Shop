import React, { useState } from 'react';
import api from '../../../api';

const EmailCampaign = () => {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [recipients, setRecipients] = useState('all'); // all | customers | vip | manual
  const [manualList, setManualList] = useState('');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);

  const sendNow = async () => {
    setSending(true);
    setResult(null);
    try {
      const payload = {
        subject,
        body,
        recipients,
        manualList: manualList.split(',').map(s => s.trim()).filter(Boolean),
      };

      // Default admin endpoint; backend may not have this yet
      const endpoint = '/api/admin/emails/send';
      const res = await api.post(endpoint, payload);
      setResult({ ok: true, data: res?.data ?? res });
    } catch (e) {
      setResult({ ok: false, error: e?.response?.data || e?.message || String(e) });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-6 rounded-md shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Gửi email tới khách hàng</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Tiêu đề</label>
          <input value={subject} onChange={(e) => setSubject(e.target.value)} className="mt-1 block w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Nội dung</label>
          <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={6} className="mt-1 block w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Người nhận</label>
          <select value={recipients} onChange={(e) => setRecipients(e.target.value)} className="mt-1 block w-48 border rounded px-3 py-2">
            <option value="all">Tất cả khách hàng</option>
            <option value="customers">Khách hàng đã mua</option>
            <option value="vip">VIP</option>
            <option value="manual">Danh sách thủ công</option>
          </select>
        </div>
        {recipients === 'manual' && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Danh sách email (phân tách bằng dấu phẩy)</label>
            <input value={manualList} onChange={(e) => setManualList(e.target.value)} className="mt-1 block w-full border rounded px-3 py-2" />
          </div>
        )}

        <div className="flex items-center gap-3">
          <button onClick={sendNow} disabled={sending} className="px-4 py-2 bg-orange-600 text-white rounded disabled:opacity-60">{sending ? 'Đang gửi...' : 'Gửi ngay'}</button>
          <div className="text-sm text-gray-600">Lưu ý: endpoint <code>/api/admin/emails/send</code> phải tồn tại trên backend để thực hiện gửi.</div>
        </div>

        {result && (
          <div className={`p-3 rounded ${result.ok ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
            {result.ok ? (<div>Gửi thành công: {JSON.stringify(result.data)}</div>) : (<div>Lỗi gửi: {JSON.stringify(result.error)}</div>)}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailCampaign;
