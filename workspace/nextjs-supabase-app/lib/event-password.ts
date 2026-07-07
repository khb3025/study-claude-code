import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

// 참가 비밀번호를 salt:hash(hex) 형태로 저장한다(평문 저장 금지)
export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyEventPassword(password: string, passwordHash: string) {
  const [salt, hash] = passwordHash.split(":");
  const hashBuffer = Buffer.from(hash, "hex");
  const candidateBuffer = scryptSync(password, salt, 64);
  return (
    hashBuffer.length === candidateBuffer.length &&
    timingSafeEqual(hashBuffer, candidateBuffer)
  );
}
