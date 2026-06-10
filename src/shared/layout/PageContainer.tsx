"use client";

/**
 * PageContainer — wraps page content with consistent max-width, padding,
 * and optional page-level heading for accessibility.
 *
 * @param {PageContainerProps} props - Component props.
 * @returns {JSX.Element} A main content area container.
 */

import React from "react";

interface PageContainerProps {
  /** Optional H1 heading rendered at the top of the content area. */
  title?: string;
  /** Optional description shown below the title. */
  description?: string;
  /** Page content. */
  children: React.ReactNode;
  /** Extra CSS class applied to the outer container. */
  className?: string;
}

/**
 * Consistent page-level content wrapper with optional heading.
 *
 * @param {PageContainerProps} props
 * @returns {JSX.Element}
 */
function PageContainer({
  title,
  description,
  children,
  className = "",
}: PageContainerProps): JSX.Element {
  return (
    <main
      className={[
        "flex-1 overflow-y-auto px-6 py-6",
        className,
      ].join(" ")}
    >
      {(title ?? description) && (
        <div className="mb-6">
          {title && (
            <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
          )}
          {description && (
            <p className="mt-1 text-sm text-gray-500">{description}</p>
          )}
        </div>
      )}
      {children}
    </main>
  );
}

export default PageContainer;
