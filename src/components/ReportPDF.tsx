import React from 'react';
import { Document, Page, Text, View, StyleSheet, PDFViewer } from '@react-pdf/renderer';
import { Report } from '../types/Report';
import { format } from 'date-fns';

const styles = StyleSheet.create({
  page: {
    padding: 30,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  header: {
    fontSize: 12,
    marginBottom: 20,
    color: '#666',
  },
  section: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  content: {
    fontSize: 12,
    lineHeight: 1.5,
  },
});

interface ReportPDFProps {
  report: Report;
}

export const ReportPDF: React.FC<ReportPDFProps> = ({ report }) => {
  return (
    <PDFViewer style={{ width: '100%', height: '500px' }}>
      <Document>
        <Page size="A4" style={styles.page}>
          <Text style={styles.title}>{report.title}</Text>
          <Text style={styles.header}>
            Generated on {format(new Date(), 'MMMM dd, yyyy')}
          </Text>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Summary</Text>
            <Text style={styles.content}>{report.summary}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Details</Text>
            <Text style={styles.content}>{report.details}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Status</Text>
          </View>
        </Page>
      </Document>
    </PDFViewer>
  );
};