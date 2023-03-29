import { NextApiRequest, NextApiResponse } from 'next';

export async function sendFileToAPI(file: File): Promise<any> {
  const formData = new FormData();
  formData.append('syllabus', file);

  const response = await fetch(`${process.env.OPENSYLLABUS_PARSER_API_URL}`, {
    method: 'POST',
    body: formData,
    headers: {
      Authorization: `Token ${process.env.OPENSYLLABUS_PARSER_API_TOKEN}`,
    },
  });

  const data = await response.json();
  return data;
}