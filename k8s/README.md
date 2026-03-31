# Kubernetes Deployment

## Apply
kubectl apply -f k8s/deployment.yaml

## Scale
kubectl scale deployment ai-growth-app --replicas=5

## Notes
- Use LoadBalancer for external access
- Ensure cluster is configured
