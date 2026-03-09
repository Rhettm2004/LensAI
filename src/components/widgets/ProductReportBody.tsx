import React from 'react';
import type { AnalysisOutput } from '../../types';

export type ProductReportBodyProps = {
  analysis: AnalysisOutput;
};

export const ProductReportBody: React.FC<ProductReportBodyProps> = ({ analysis }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
    <div style={{ fontSize: 13, color: '#f5f6fa' }}>
      <strong>Business model overview</strong>
    </div>
    <div style={{ fontSize: 13 }}>{analysis.businessModelOverview}</div>
    <div style={{ fontSize: 13, marginTop: 4 }}>
      <strong>Revenue drivers</strong>
    </div>
    <div style={{ fontSize: 13 }}>{analysis.revenueDrivers}</div>
    <div style={{ fontSize: 13, marginTop: 4 }}>
      <strong>Industry positioning</strong>
    </div>
    <div style={{ fontSize: 13 }}>{analysis.industryPositioning}</div>
  </div>
);
