import axiosInstance from './axiosInstance';

/**
 * All Knowledge Base API calls live here. UI components never call
 * axios directly — they call these functions.
 */

/**
 * Append a PDF to the existing knowledge base.
 * @param {File} file
 * @returns {Promise<import('axios').AxiosResponse>}
 */
export const uploadPDF = (file) => {
  const formData = new FormData();
  formData.append('file', file);

  return axiosInstance.post('/knowledge/upload-pdf', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

/**
 * Append raw text to the existing knowledge base.
 * @param {string} text
 * @returns {Promise<import('axios').AxiosResponse>}
 */
export const addText = (text) => {
  return axiosInstance.post('/knowledge/add-text', { text });
};

/**
 * Replace the entire knowledge base with a single PDF.
 * @param {File} file
 * @returns {Promise<import('axios').AxiosResponse>}
 */
export const reindex = (file) => {
  const formData = new FormData();
  formData.append('file', file);

  return axiosInstance.post('/knowledge/reindex', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};
