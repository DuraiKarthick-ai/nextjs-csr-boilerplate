---
description: Describe when these instructions should be loaded by the agent based on task context
# applyTo: 'Describe when these instructions should be loaded by the agent based on task context' # when provided, instructions will automatically be added to the request context when the pattern matches an attached file
---

<!-- Tip: Use /create-instructions in chat to generate content with agent assistance -->

1.Follow OWASP Top 10 security guidelines by validating all user inputs, preventing XSS through proper output encoding, avoiding insecure client-side logic, and ensuring access control checks are enforced on the server side.


2.Follow strict TypeScript standards by enabling strict: true, avoiding any type, defining explicit types and interfaces for props, API responses, and state, and ensuring all functions have clear return types.


3.Follow clear function documentation standards by adding JSDoc-style comments for every function, clearly describing the function purpose, parameters, return type, and any security or validation applied.


4.Follow single responsibility principle by ensuring each component, hook, or function performs only one clearly defined task and avoids mixed concerns.


5.Follow proper component structure by using small, reusable, and composable components, keeping UI logic separate from business logic, and avoiding overly large components.


6.Follow Next.js App Router best practices by using Server Components by default, adding "use client" only when required, and minimizing client-side JavaScript for better performance.


7.Follow consistent naming conventions such as PascalCase for React components, camelCase for functions and variables, meaningful names over abbreviations, and lowercase folder names.


8.Follow clean folder organization by separating components, hooks, utilities, services, and API logic into clearly defined directories to improve readability and maintainability.


9.Follow secure API consumption practices by handling all sensitive logic on the server, never trusting client-side data, and always validating API request and response data.


10.Follow environment variable handling rules by accessing secrets only through environment variables, never hardcoding sensitive values, and using NEXT_PUBLIC_ prefix only for safe client-side variables.


11.Follow proper error handling patterns by showing user-friendly error messages on the UI, handling failures gracefully, and never exposing stack traces or sensitive details in the frontend.


12.Follow logging best practices by avoiding logging sensitive information such as tokens, secrets, or PII, and ensuring logs are meaningful and minimal.


13.Follow performance optimization guidelines by using next/image for images, memoization (useMemo, useCallback) where necessary, pagination for large lists, and avoiding unnecessary re-renders.


14.Follow accessibility (a11y) standards by using semantic HTML, proper ARIA attributes, keyboard navigation support, and sufficient color contrast.


15.Follow code readability rules by limiting function length, avoiding deep nesting, using early returns, and formatting code consistently with ESLint and Prettier.


16.Follow Git and code review standards by submitting clean pull requests, addressing review comments, removing dead code, and ensuring all code meets the defined standards before merge.

17.Add in functions clear function documentation with JSDoc comments, describing the purpose, parameters, return type, and any security considerations for each function.
eg: /**
 * Fetches data from the API endpoint.
 * @param {string} endpoint - The API endpoint to fetch data from.
 * @returns {Promise<any>} - A promise that resolves to the fetched data.
 */

 18.All unit test should be follow up with arrange, act and assert comments to clearly delineate the different phases of the test.
 eg code: it("uses portalUrl prop when provided instead of default PORTAL_LOGIN_URL", () => {
  // Arrange
      mockUsePortalAuth.mockReturnValue({
        ...authenticatedAuth,
        isResolvingCtx: false,
        isStandalone: true,
      });
// Act
      render(<AuthGate portalUrl="http://custom-portal:8080"><p>Protected</p></AuthGate>);
// Assert
      expect(screen.getByRole("link", { name: /go to portal/i })).toHaveAttribute(
        "href",
        "http://custom-portal:8080",
      );
    });

19.Whenever code change happen in a file, ensure that all related unit tests are updated to reflect the changes, maintaining test coverage and ensuring that all tests pass successfully before merging.

20.Whenever new functions or components are added, ensure that corresponding unit tests are created to cover the new code, following the arrange-act-assert pattern and providing comprehensive test coverage for all new functionality.

21.Make all the static values in const, enum, or configuration files, and avoid hardcoding values directly in the code to improve maintainability and readability.
