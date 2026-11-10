import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";

export type PdfRow = { label: string; value: string };
export type PdfSection = { title: string; rows: PdfRow[] };
export type PdfData = {
    title: string;
    reference: string;
    meta: PdfRow[];
    sections: PdfSection[];
};

const NAVY = "#002950";
const GREY = "#64748B";
const INK = "#0F172A";
const RULE = "#E2E8F0";

const styles = StyleSheet.create({
    page: {
        paddingTop: 40,
        paddingBottom: 52,
        paddingHorizontal: 42,
        fontFamily: "Helvetica",
        fontSize: 10,
        color: INK,
    },
    kicker: { fontSize: 9, color: GREY, marginBottom: 4 },
    title: { fontSize: 22, fontFamily: "Helvetica-Bold", color: NAVY },
    metaWrap: {
        flexDirection: "row",
        flexWrap: "wrap",
        marginTop: 12,
        paddingBottom: 14,
        borderBottomWidth: 2,
        borderBottomColor: NAVY,
    },
    metaItem: { marginRight: 28, marginBottom: 2 },
    section: { marginTop: 18 },
    sectionTitle: {
        fontSize: 12,
        fontFamily: "Helvetica-Bold",
        color: NAVY,
        paddingBottom: 5,
        marginBottom: 2,
        borderBottomWidth: 1,
        borderBottomColor: NAVY,
    },
    row: {
        flexDirection: "row",
        paddingVertical: 5,
        borderBottomWidth: 0.5,
        borderBottomColor: RULE,
    },
    label: {
        width: "34%",
        paddingRight: 12,
        fontSize: 9,
        fontFamily: "Helvetica-Bold",
        color: GREY,
    },
    value: { width: "66%", fontSize: 10, lineHeight: 1.4 },
    footer: {
        position: "absolute",
        bottom: 24,
        left: 42,
        right: 42,
        flexDirection: "row",
        justifyContent: "space-between",
        fontSize: 8,
        color: GREY,
    },
});

export function BriefingPdf({ data }: { data: PdfData }) {
    return (
        <Document title={`${data.reference} - ${data.title}`}>
            <Page size="A4" style={styles.page}>
                <Text style={styles.kicker}>Briefing de projecto</Text>
                <Text style={styles.title}>{data.title}</Text>

                <View style={styles.metaWrap}>
                    {[{ label: "Referência", value: data.reference }, ...data.meta].map(
                        (m) => (
                            <View key={m.label} style={styles.metaItem}>
                                <Text style={styles.label}>{m.label}</Text>
                                <Text style={{ fontSize: 10 }}>{m.value}</Text>
                            </View>
                        )
                    )}
                </View>

                {data.sections.map((section) => (
                    <View key={section.title} style={styles.section}>
                        <Text style={styles.sectionTitle} minPresenceAhead={60}>
                            {section.title}
                        </Text>

                        {section.rows.map((row, i) => (
                            <View key={`${row.label}-${i}`} style={styles.row} wrap={false}>
                                <Text style={styles.label}>{row.label}</Text>
                                <Text style={styles.value}>{row.value}</Text>
                            </View>
                        ))}
                    </View>
                ))}

                <View style={styles.footer} fixed>
                    <Text>{data.reference}</Text>
                    <Text
                        render={({ pageNumber, totalPages }) =>
                            `${pageNumber} / ${totalPages}`
                        }
                    />
                </View>
            </Page>
        </Document>
    );
}