import fs from 'fs';

export const getBase64 = (data) => {
  const buffer = Buffer.from(data, 'base64');
  const base64Data = buffer.toString('utf-8');
  return base64Data;
};

export const createFolder = async (path) => {
  try {
    await fs.promises.access(path, fs.constants.F_OK);
  } catch (err) {
    if (err.code === 'ENOENT') {
      await fs.promises.mkdir(path, { recursive: true });
      console.log('Storing folder created.');
    } else {
      console.error('Error checking storing folder:', err);
    }
  }
};
