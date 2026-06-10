"use client";

/**
 * Tabs â€” MUI-based tab-panel component.
 * Keyboard navigation is handled natively by MUI.
 *
 * @param {TabsProps} props - Component props.
 * @returns {JSX.Element} A labelled MUI tab list with the active panel shown.
 */

import React, { useState } from "react";
import MuiTabs from "@mui/material/Tabs";
import MuiTab from "@mui/material/Tab";
import Box from "@mui/material/Box";

/** A single tab definition. */
export interface TabItem {
  /** Unique key used as ARIA id anchor. */
  key: string;
  /** Visible tab label. */
  label: string;
  /** Content rendered when this tab is active. */
  content: React.ReactNode;
  /** When true, the tab cannot be selected. */
  disabled?: boolean;
}

interface TabsProps {
  /** Ordered list of tab definitions. */
  tabs: TabItem[];
  /** Key of the initially active tab. Defaults to the first tab. */
  defaultActiveKey?: string;
  /** Optional CSS class applied to the wrapper div. */
  className?: string;
  /** Callback fired when the active tab changes. */
  onChange?: (key: string) => void;
}

/**
 * Tabs component built on MUI Tabs with ARIA roles.
 *
 * @param {TabsProps} props
 * @returns {JSX.Element}
 */
function Tabs({ tabs, defaultActiveKey, className = "", onChange }: TabsProps): JSX.Element {
  const [activeKey, setActiveKey] = useState<string>(
    defaultActiveKey ?? tabs[0]?.key ?? ""
  );

  const activeIndex = tabs.findIndex((t) => t.key === activeKey);

  /**
   * Handles MUI tab change event.
   *
   * @param {React.SyntheticEvent} _ - Ignored synthetic event.
   * @param {number} newIndex - Index of the newly selected tab.
   */
  function handleChange(_: React.SyntheticEvent, newIndex: number): void {
    const key = tabs[newIndex]?.key;
    if (key) {
      setActiveKey(key);
      onChange?.(key);
    }
  }

  const activeTab = tabs.find((t) => t.key === activeKey);

  return (
    <Box className={className}>
      <MuiTabs
        value={activeIndex === -1 ? 0 : activeIndex}
        onChange={handleChange}
        aria-label="feature tabs"
        variant="scrollable"
        scrollButtons="auto"
      >
        {tabs.map((tab) => (
          <MuiTab
            key={tab.key}
            label={tab.label}
            disabled={tab.disabled}
            id={`tab-${tab.key}`}
            aria-controls={`tabpanel-${tab.key}`}
          />
        ))}
      </MuiTabs>

      {activeTab && (
        <Box
          role="tabpanel"
          id={`tabpanel-${activeTab.key}`}
          aria-labelledby={`tab-${activeTab.key}`}
          sx={{ pt: 2 }}
        >
          {activeTab.content}
        </Box>
      )}
    </Box>
  );
}

export default Tabs;
