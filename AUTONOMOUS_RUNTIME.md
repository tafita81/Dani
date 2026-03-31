# Autonomous Runtime (Manus/Replit Ready)

## Goal
Run, deploy and keep the system in production 24/7 with zero manual input.

---

## Boot Sequence

1) Install
```
npm install
```

2) Infra
```
docker-compose up -d
```

3) Build & Start
```
npm run build
npm start
```

4) Frontend
```
cd client && npm install && npm run dev
```

5) WhatsApp Listener
```
node server/whatsapp/listener.js
```

---

## Continuous Loop (MANDATORY)

Repeat forever:
- read WhatsApp messages
- extract emotion signals
- generate scripts
- generate variations (variationEngine)
- optimize hooks (hookOptimizer)
- choose style per niche (nicheStyleModel)
- render videos
- autopost (TikTok/Instagram/YouTube)
- collect metrics
- update models
- scale winners

---

## Health Checks

- GET /health must return 200
- restart service on failure

---

## Kubernetes

```
kubectl apply -f k8s/
```

Ensure HPA is applied.

---

## CI/CD

On every push to main:
- build
- docker push
- deploy to k8s

---

## Rules

- Never stop the loop
- No manual prompts
- Log errors and retry
- Keep services alive

---

## Output

- videos generated continuously
- posts published
- metrics increasing

System must remain running 24/7 autonomously.