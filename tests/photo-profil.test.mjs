// Tests de la vérification des photos de profil (sans réseau).
import { test } from "node:test";
import assert from "node:assert/strict";
import { verifierPhoto } from "../src/lib/profil/photo.ts";

const jpeg = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0]);
const png = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0]);
const webp = new Uint8Array([...Buffer.from("RIFF"), 0, 0, 0, 0, ...Buffer.from("WEBP"), 0]);

test("les images JPG, PNG et WebP sont reconnues par leur contenu", () => {
  assert.equal(verifierPhoto(jpeg).format.extension, "jpg");
  assert.equal(verifierPhoto(png).format.extension, "png");
  assert.equal(verifierPhoto(webp).format.extension, "webp");
});

test("un fichier qui n'est pas une image est refusé, même renommé en .jpg", () => {
  const pdf = new Uint8Array([...Buffer.from("%PDF-1.7")]);
  const html = new Uint8Array([...Buffer.from("<script>alert(1)</script>")]);
  assert.equal(verifierPhoto(pdf).ok, false);
  assert.equal(verifierPhoto(html).ok, false);
  assert.equal(verifierPhoto(new Uint8Array()).ok, false);
});

test("une photo de plus de 2 Mo est refusée", () => {
  const lourde = new Uint8Array(2 * 1024 * 1024 + 1);
  lourde.set(jpeg);
  assert.equal(verifierPhoto(lourde).ok, false);
});
