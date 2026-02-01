# Page snapshot

```yaml
- dialog "Unhandled Runtime Error" [ref=e3]:
  - generic [ref=e4]:
    - generic [ref=e5]:
      - generic [ref=e6]:
        - navigation [ref=e7]:
          - button "previous" [disabled] [ref=e8]:
            - img "previous" [ref=e9]
          - button "next" [disabled] [ref=e11]:
            - img "next" [ref=e12]
          - generic [ref=e14]: 1 of 1 error
          - generic [ref=e15]:
            - text: Next.js (14.2.21) is outdated
            - link "(learn more)" [ref=e17] [cursor=pointer]:
              - /url: https://nextjs.org/docs/messages/version-staleness
        - button "Close" [ref=e18] [cursor=pointer]:
          - img [ref=e20]
      - heading "Unhandled Runtime Error" [level=1] [ref=e23]
      - paragraph [ref=e24]: "Error: localStorage unavailable"
    - generic [ref=e25]:
      - heading "Source" [level=2] [ref=e26]
      - generic [ref=e27]:
        - link "src/components/onboarding.tsx (73:36) @ getItem" [ref=e29] [cursor=pointer]:
          - generic [ref=e30]: src/components/onboarding.tsx (73:36) @ getItem
          - img [ref=e31]
        - generic [ref=e35]: "71 | setMounted(true); 72 | // Check if onboarding has been completed > 73 | const completed = localStorage.getItem(ONBOARDING_KEY); | ^ 74 | if (!completed) { 75 | // Small delay to let the page load first 76 | const timer = setTimeout(() => setOpen(true), 500);"
      - heading "Call Stack" [level=2] [ref=e36]
      - button "Show collapsed frames" [ref=e37] [cursor=pointer]
```