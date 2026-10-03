import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'vite';
const server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom' });
try {
  const { sertifikatService } = await server.ssrLoadModule('/src/services/sertifikatService.js');
  const { default: api } = await server.ssrLoadModule('/src/services/api.js');
  // Keep Axios serialization; replace only its network boundary.
  api.interceptors.request.clear();
  test('certificate update sends multipart POST with Laravel method override', async () => {
    let request;
    api.defaults.adapter = async config => { request=config; return {status:200,statusText:'OK',headers:{},config,data:{data:{id:3}}}; };
    await sertifikatService.update(3,{nama_sertifikat:'Updated',file_sertifikat:new Blob(['pdf'],{type:'application/pdf'})});
    assert.equal(request.method,'post');
    assert.equal(request.data.get('_method'),'PUT');
    assert.equal(request.data.get('nama_sertifikat'),'Updated');
    assert.equal(request.data.get('file_sertifikat').type,'application/pdf');
  });
} finally { await server.close(); }
