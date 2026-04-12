import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from '@react-pdf/renderer'
import { calcAreas } from '../../utils/roomGeometry'

// NotoSansKR 폰트 등록 (한국어 지원)
// client/public/fonts/NotoSansKR-Regular.ttf 파일이 필요합니다.
Font.register({
  family: 'NotoSansKR',
  fonts: [
    { src: '/fonts/NotoSansKR-Regular.ttf', fontWeight: 400 },
    { src: '/fonts/NotoSansKR-Bold.ttf', fontWeight: 700 },
  ],
})

const styles = StyleSheet.create({
  page: {
    fontFamily: 'NotoSansKR',
    padding: 40,
    fontSize: 10,
    color: '#1a1a2e',
  },
  title: {
    fontSize: 20,
    fontWeight: 700,
    textAlign: 'center',
    marginBottom: 24,
    color: '#1e3a5f',
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 700,
    marginBottom: 8,
    color: '#1e3a5f',
    borderBottom: '1pt solid #e2e8f0',
    paddingBottom: 4,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  label: {
    width: 100,
    color: '#6b7280',
  },
  value: {
    flex: 1,
  },
  table: {
    marginTop: 8,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#1e3a5f',
    color: '#ffffff',
    padding: '6 4',
    fontWeight: 700,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '0.5pt solid #e2e8f0',
    padding: '5 4',
  },
  tableRowAlt: {
    backgroundColor: '#f8fafc',
  },
  col1: { width: '12%' },
  col2: { width: '18%' },
  col3: { width: '12%', textAlign: 'right' },
  col4: { width: '14%', textAlign: 'right' },
  col5: { width: '16%', textAlign: 'right' },
  col6: { width: '14%', textAlign: 'right' },
  col7: { width: '14%', textAlign: 'right' },
  totalRow: {
    flexDirection: 'row',
    backgroundColor: '#eff6ff',
    padding: '7 4',
    borderTop: '1.5pt solid #2563eb',
    fontWeight: 700,
    fontSize: 11,
  },
  totalLabel: { flex: 1 },
  totalValue: { color: '#2563eb' },
  footer: {
    marginTop: 32,
    borderTop: '0.5pt solid #e2e8f0',
    paddingTop: 12,
    color: '#9ca3af',
    fontSize: 8,
    textAlign: 'center',
  },
})

const CATEGORY_LABELS = {
  floor: '바닥재',
  wall: '벽지',
  ceiling: '천장재',
  baseboard: '걸레받이',
}

const ROOM_TYPE_LABELS = {
  living_room: '거실',
  bedroom: '침실',
  kitchen: '주방',
  bathroom: '욕실',
  office: '사무실',
  dining_room: '식당',
  study: '서재',
  hallway: '복도',
}

function fmt(n) {
  return n.toLocaleString('ko-KR') + '원'
}

export default function EstimatePDF({ customerInfo, analysisResult, selectedMaterials, costs }) {
  const areas = calcAreas(analysisResult.dimensions)
  const today = new Date()
  const validUntil = new Date(today)
  validUntil.setDate(today.getDate() + 30)

  const dateStr = (d) =>
    `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`

  const categories = ['floor', 'wall', 'ceiling', 'baseboard']
  const { width, length, height } = analysisResult.dimensions

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>인테리어 공사 견적서</Text>

        {/* 고객 정보 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>고객 정보</Text>
          <View style={styles.row}>
            <Text style={styles.label}>고객명</Text>
            <Text style={styles.value}>{customerInfo.name || '-'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>주소</Text>
            <Text style={styles.value}>{customerInfo.address || '-'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>연락처</Text>
            <Text style={styles.value}>{customerInfo.phone || '-'}</Text>
          </View>
        </View>

        {/* 공사 정보 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>공사 정보</Text>
          <View style={styles.row}>
            <Text style={styles.label}>방 종류</Text>
            <Text style={styles.value}>{ROOM_TYPE_LABELS[analysisResult.roomType] || analysisResult.roomType}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>치수</Text>
            <Text style={styles.value}>
              너비 {width}m × 길이 {length}m × 높이 {height}m
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>견적일</Text>
            <Text style={styles.value}>{dateStr(today)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>견적 유효기간</Text>
            <Text style={styles.value}>{dateStr(validUntil)} (30일)</Text>
          </View>
        </View>

        {/* 견적 명세 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>견적 명세</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.col1}>구분</Text>
              <Text style={styles.col2}>자재명</Text>
              <Text style={styles.col3}>면적</Text>
              <Text style={styles.col4}>단가(m²)</Text>
              <Text style={styles.col5}>자재비</Text>
              <Text style={styles.col6}>시공비</Text>
              <Text style={styles.col7}>소계</Text>
            </View>

            {categories.map((cat, idx) => {
              const mat = selectedMaterials[cat]
              if (!mat) return null
              const cost = costs[cat]
              const area = areas[cat]
              return (
                <View
                  key={cat}
                  style={[styles.tableRow, idx % 2 === 1 && styles.tableRowAlt]}
                >
                  <Text style={styles.col1}>{CATEGORY_LABELS[cat]}</Text>
                  <Text style={styles.col2}>{mat.name}</Text>
                  <Text style={styles.col3}>{area.toFixed(1)}m²</Text>
                  <Text style={styles.col4}>{mat.unitPrice.toLocaleString()}</Text>
                  <Text style={styles.col5}>{fmt(cost.material)}</Text>
                  <Text style={styles.col6}>{fmt(cost.labor)}</Text>
                  <Text style={styles.col7}>{fmt(cost.material + cost.labor)}</Text>
                </View>
              )
            })}

            <View style={[styles.tableRow, { backgroundColor: '#f1f5f9' }]}>
              <Text style={[styles.col1, { flex: 1, fontWeight: 700 }]}>소계</Text>
              <Text style={[styles.col7, { fontWeight: 700 }]}>{fmt(costs.subtotal)}</Text>
            </View>
            <View style={[styles.tableRow, { backgroundColor: '#f1f5f9' }]}>
              <Text style={[styles.col1, { flex: 1 }]}>부가세 (10%)</Text>
              <Text style={styles.col7}>{fmt(costs.vat)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>최종 합계</Text>
              <Text style={styles.totalValue}>{fmt(costs.total)}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.footer}>
          본 견적서의 유효기간은 발행일로부터 30일입니다. | 재료비 손실율 10% 포함 | 부가세 10% 별도
        </Text>
      </Page>
    </Document>
  )
}
