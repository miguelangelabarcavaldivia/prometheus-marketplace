#!/usr/bin/env node
/**
 * Upload GitHub workflow files using the GitHub API.
 * Requires GITHUB_TOKEN environment variable with appropriate scope.
 */

import { readFileSync } from 'fs';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';
const OWNER = 'miguelangelabarcavaldivia';
const REPO = 'prometheus-marketplace';
const BRANCH = 'master';

const workflowFiles = [
  { path: '.github/workflows/ci.yml', localPath: '.github/workflows/ci.yml' },
  { path: '.github/workflows/publish-npm.yml', localPath: '.github/workflows/publish-npm.yml' },
  { path: '.github/workflows/review.yml', localPath: '.github/workflows/review.yml' },
  { path: '.github/workflows/stale.yml', localPath: '.github/workflows/stale.yml' },
  { path: '.github/workflows/labeler.yml', localPath: '.github/workflows/labeler.yml' },
];

async function getBranchRef() {
  const res = await fetch(
    `https://api.github.com/repos/${OWNER}/${REPO}/git/refs/heads/${BRANCH}`,
    {
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        'User-Agent': 'Prometheus-Deploy',
        Accept: 'application/vnd.github.v3+json',
      },
    }
  );
  if (!res.ok) throw new Error(`Failed to get branch ref: ${res.status}`);
  const data = await res.json();
  return data.object.sha;
}

async function getBaseTree(sha) {
  const res = await fetch(
    `https://api.github.com/repos/${OWNER}/${REPO}/git/trees/${sha}?recursive=1`,
    {
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        'User-Agent': 'Prometheus-Deploy',
        Accept: 'application/vnd.github.v3+json',
      },
    }
  );
  if (!res.ok) throw new Error(`Failed to get tree: ${res.status}`);
  return (await res.json()).tree;
}

function buildTree(baseTree, files) {
  return files.map(file => {
    const content = readFileSync(file.localPath, 'utf8');
    const basePath = baseTree.find(t => t.path === file.path);
    return {
      path: file.path,
      mode: basePath ? basePath.mode : '100644',
      type: 'blob',
      content: content,
    };
  });
}

async function createCommit(message, treeSha, parentSha) {
  const res = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/git/commits`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      'User-Agent': 'Prometheus-Deploy',
      'Content-Type': 'application/json',
      Accept: 'application/vnd.github.v3+json',
    },
    body: JSON.stringify({
      message,
      tree: treeSha,
      parents: [parentSha],
    }),
  });
  if (!res.ok) throw new Error(`Failed to create commit: ${res.status} ${await res.text()}`);
  return await res.json();
}

async function updateRef(commitSha) {
  const res = await fetch(
    `https://api.github.com/repos/${OWNER}/${REPO}/git/refs/heads/${BRANCH}`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        'User-Agent': 'Prometheus-Deploy',
        'Content-Type': 'application/json',
        Accept: 'application/vnd.github.v3+json',
      },
      body: JSON.stringify({ sha: commitSha }),
    }
  );
  if (!res.ok) throw new Error(`Failed to update ref: ${res.status} ${await res.text()}`);
  return await res.json();
}

async function main() {
  console.log('Starting workflow upload...');
  const baseSha = await getBranchRef();
  console.log(`Base SHA: ${baseSha}`);
  const baseTree = await getBaseTree(baseSha);
  console.log(`Base tree entries: ${baseTree.length}`);
  const tree = buildTree(baseTree, workflowFiles);
  console.log(`New tree entries: ${tree.length}`);
  const newTree = await fetch(
    `https://api.github.com/repos/${OWNER}/${REPO}/git/trees`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        'User-Agent': 'Prometheus-Deploy',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tree }),
    }
  );
  if (!newTree.ok) throw new Error(`Failed to create tree: ${newTree.status}`);
  const newTreeSha = (await newTree.json()).sha;
  const commit = await createCommit('chore: add workflow files', newTreeSha, baseSha);
  await updateRef(commit.sha);
  console.log(`✅ Workflow files uploaded! Commit: ${commit.sha}`);
}

main().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
