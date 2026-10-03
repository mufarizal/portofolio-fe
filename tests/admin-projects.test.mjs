import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'vite';
const server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom' });
try {
  const { projectService } = await server.ssrLoadModule('/src/services/projectService.js');
  const { default: api } = await server.ssrLoadModule('/src/services/api.js');
  // Keep Axios serialization; replace only its network boundary.
  api.interceptors.request.clear();
  test('admin lists unsynced GitHub repos without dropping them or confusing GitHub and database IDs', async () => {
    api.defaults.adapter = async config => ({status:200, statusText:'OK', headers:{}, config, data:{status:true,data: config.url === '/admin/projects/github' ? [{github_id:900,nama:'new',is_active:'0'},{github_id:901,nama:'saved',is_active:1}] : [{id:7,github_id:901,nama:'saved'}]}});
    const projects = await projectService.getGithub();
    assert.equal(projects[0].github_id,900);
    assert.equal(projects[0].id,null);
    assert.equal(projects[0].is_active,false);
    assert.equal(projects[1].id,7);
    assert.equal(projects[1].is_active,true);
  });
  test('visibility sends a boolean and GitHub ID and propagates server failures', async () => {
    let request;
    api.defaults.adapter = async config => { request=config; return {status:200,statusText:'OK',headers:{},config,data:{status:true,data:{id:7,github_id:901,is_active:0}}}; };
    const result = await projectService.setVisibility(901,false);
    assert.equal(request.url,'/admin/projects/901/visibility');
    assert.deepEqual(JSON.parse(request.data),{is_active:false});
    assert.equal(result.is_active,0);
    api.defaults.adapter = async () => {throw new Error('network failure');};
    await assert.rejects(projectService.setVisibility(901,true),/network failure/);
  });
  test('sync uses admin sync endpoint and returns counts', async () => {
    api.defaults.adapter = async config => { assert.equal(config.url,'/admin/projects/sync'); assert.equal(config.method,'post'); return {status:200,statusText:'OK',headers:{},config,data:{status:true,data:{synced:18,created:4}}}; };
    assert.deepEqual(await projectService.syncGithub(),{synced:18,created:4});
  });
} finally { await server.close(); }
