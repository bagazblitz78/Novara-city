import { describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';
import { readJsonBody } from '@/server/api/http';
import { BadRequestError } from '@/lib/errors';

/**
 * readJsonBody is the single entry point for JSON request bodies. Its job is
 * to turn the parser's raw SyntaxError (which would otherwise surface as an
 * opaque 500) into a typed 400 the API layer renders correctly.
 */

function post(body: string): NextRequest {
  return new NextRequest('http://localhost/api/v1/test', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body,
  });
}

describe('readJsonBody', () => {
  it('parses a valid JSON body', async () => {
    await expect(readJsonBody(post('{"identifier":"mirai","password":"x"}'))).resolves.toEqual({
      identifier: 'mirai',
      password: 'x',
    });
  });

  it('throws BadRequestError on malformed JSON', async () => {
    await expect(readJsonBody(post('{ this is not json'))).rejects.toBeInstanceOf(BadRequestError);
  });

  it('throws BadRequestError on an empty body', async () => {
    await expect(readJsonBody(post(''))).rejects.toBeInstanceOf(BadRequestError);
  });

  it('reports a 400 status with a stable machine code', async () => {
    const error = await readJsonBody(post('nope')).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(BadRequestError);
    const app = error as BadRequestError;
    expect(app.status).toBe(400);
    expect(app.code).toBe('BAD_REQUEST');
  });

  it('does not echo the raw parser message back to the caller', async () => {
    const error = await readJsonBody(post('{"a":')).catch((e: unknown) => e);
    // The V8 message contains position/offset details we should never return.
    expect(error).toBeInstanceOf(BadRequestError);
    expect((error as BadRequestError).message).not.toMatch(/position|line \d+/i);
  });
});
