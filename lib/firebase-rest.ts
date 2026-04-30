import config from '../firebase-applet-config.json';

const PROJECT_ID = config.projectId;
const API_KEY = config.apiKey;
const DB_ID = config.firestoreDatabaseId || '(default)';
const BASE = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/${DB_ID}/documents`;

export const firebaseAuth = {
  login: async (email: string, password: any) => {
    const res = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, returnSecureToken: true })
      }
    );
    const data = await res.json();
    if (data.error) throw new Error(data.error.message);
    return data;
  },

  register: async (email: string, password: any) => {
    const res = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, returnSecureToken: true })
      }
    );
    const data = await res.json();
    if (data.error) throw new Error(data.error.message);
    return data;
  }
};

// FIRESTORE REST HELPERS
const toValue: any = (val: any) => {
  if (typeof val === 'string') return { stringValue: val };
  if (typeof val === 'number') return { doubleValue: val };
  if (typeof val === 'boolean') return { booleanValue: val };
  if (Array.isArray(val)) return { arrayValue: { values: val.map(toValue) } };
  if (val && typeof val === 'object') return { mapValue: { fields: toFields(val) } };
  return { nullValue: null };
};

const toFields = (obj: any) => Object.fromEntries(
  Object.entries(obj).map(([k, v]) => [k, toValue(v)])
);

const fromValue: any = (val: any) => {
  if (val.stringValue !== undefined) return val.stringValue;
  if (val.integerValue !== undefined) return Number(val.integerValue);
  if (val.doubleValue !== undefined) return Number(val.doubleValue);
  if (val.booleanValue !== undefined) return val.booleanValue;
  if (val.arrayValue) return (val.arrayValue.values || []).map(fromValue);
  if (val.mapValue) return fromDoc({ fields: val.mapValue.fields });
  if (val.timestampValue) return val.timestampValue;
  return null;
};

const fromDoc: any = (doc: any) => {
  if (!doc.fields) return {};
  return Object.fromEntries(
    Object.entries(doc.fields).map(([k, v]) => [k, fromValue(v)])
  );
};

const getDocId = (doc: any) => doc.name.split('/').pop();

export const firestoreGet = async (collection: string, id: string) => {
  const res = await fetch(`${BASE}/${collection}/${id}?key=${API_KEY}`);
  if (res.status === 404) return null;
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return { id: getDocId(data), ...fromDoc(data) };
};

export const firestoreList = async (collection: string) => {
  const res = await fetch(`${BASE}/${collection}?key=${API_KEY}`);
  const data = await res.json();
  if (!data.documents) return [];
  return data.documents.map((d: any) => ({ id: getDocId(d), ...fromDoc(d) }));
};

export const firestoreAdd = async (collection: string, docData: any) => {
  const res = await fetch(`${BASE}/${collection}?key=${API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields: toFields(docData) })
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return getDocId(data);
};

export const firestoreSet = async (collection: string, id: string, docData: any) => {
  const res = await fetch(`${BASE}/${collection}/${id}?key=${API_KEY}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields: toFields(docData) })
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return true;
};
