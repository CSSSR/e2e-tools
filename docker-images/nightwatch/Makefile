version := 1

.PHONY: publish
publish:
	docker build . -t quay.csssr.cloud/csssr/e2e-tools:$(version)
	docker push quay.csssr.cloud/csssr/e2e-tools:$(version)
