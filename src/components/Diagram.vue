<script setup lang="ts">
import { ref, computed } from 'vue'
import {
	exampleDataset,
	keyToColor,
  type Dataset,
  type Row,
} from './utils'


// the diagram will be rendered using svg
// along x axis in bottom, for each dataset.row, there will be one y-line
// on this y-line, for each row.entries, there will be a rect
// first the entries will be sorted by value (biggest first, but "other" last)
// then normalized so row sum is 1
// then the rects will be drawn with color, with a margin between

const props = defineProps<{ dataset: Dataset }>()

type DrawableRow = {
  label: string
  x: number
  rects: {
    y0: number
    y1: number
    color: string
    label: string
  }[]
}

const padding = 0.02
const drawableRows = computed(() => {
  const rows = props.dataset.rows
  const maxEntries = Math.max(...rows.map(row => Object.keys(row.entries).length))
  const drawableRows: DrawableRow[] = rows.map((row, i) => {
    const entries = Object.entries(row.entries)
    const sortedEntries = entries.sort((a, b) => b[1] - a[1])
    const total = sortedEntries.reduce((acc, [_, value]) => acc + value, 0)
    let y0_start = 0
    const rects = sortedEntries.map(([label, value], j) => {
      const normalizedValue = value / total * (1 - padding * (maxEntries - 1))
      const height = normalizedValue * (1 - padding)
      const y0 = y0_start + padding / 2
      const y1 = y0 + height
      y0_start = y1 + padding / 2
      const color = keyToColor(label)
      return { y0, y1, color, label }
    })
    return { label: row.label, x: i / (rows.length-0.9), rects }
  })
  return drawableRows
})

// we also want a layer with one path per unique entry label, spanning all rows
// we will but bezier curves between the rects, with control points at the midpoints
// eg. row0.y0 to row1.y0, row1.y0 to row1.y1, row1.y1 to row0.y1

const bands = computed(() => {
  const rows = drawableRows.value
  const labels = new Set<string>()
  rows.forEach(row => row.rects.forEach(rect => labels.add(rect.label)))
  const labelToPaths = Array.from(labels).map(label => {
    const points_y0 = rows.map(row => {
      const rect = row.rects.find(rect => rect.label === label) || {y0:0, y1:0}
      return { x: row.x, y: rect.y0 }
    })
    const points_y1 = rows.map(row => {
      const rect = row.rects.find(rect => rect.label === label) || {y0:0, y1:0}
      return { x: row.x, y: rect.y1 }
    }).reverse()
    type Point = {x: number, y: number}
    const start = ({x, y}: Point)=> `M ${x} ${y}`
    const bezier = (c1: Point, c2: Point, to: Point)=> `C ${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${to.x} ${to.y}`
    const line = ({x, y}: Point)=> `L ${x} ${y}`
    const pathString = [
      start(points_y0[0]),
      ...points_y0.slice(1).map((to, i) => bezier(
        {x: (points_y0[i].x + points_y0[i + 1].x) / 2, y: points_y0[i].y},
        {x: (points_y0[i].x + points_y0[i + 1].x) / 2, y: to.y},
        to
      )),
      line(points_y1[0]),
      ...points_y1.slice(1).map((to, i) => bezier(
        {x: (points_y1[i].x + points_y1[i + 1].x) / 2, y: points_y1[i].y},
        {x: (points_y1[i].x + points_y1[i + 1].x) / 2, y: to.y},
        to
      )),
      line(points_y0[0]),
    ].join(' ')
    return {pathString, color: keyToColor(label), label}
  })

  return labelToPaths//.slice(0, 1)
})

</script>

<template>
  <svg width="100%" height="100%" viewBox="0 0 1 1">
    <g v-for="row in drawableRows" :key="row.label">
      <text :x="row.x" y="0.95" text-anchor="middle">{{ row.label }}</text>
      <g v-for="rect in row.rects" :key="rect.label" :opacity="0.3">
        <rect :x="row.x" :y="rect.y0" :width="1 / exampleDataset.rows.length * 0.1" :height="rect.y1 - rect.y0" :fill="rect.color" />
      </g>
    </g>
    <g v-for="band in bands" :key="band.label">
      <path :d="band.pathString" :fill="band.color" stroke="black" stroke-width="0.0"/>
    </g>
  </svg>
</template>

<style scoped>
text {
  font-size: 0.05;
  fill: black;
}
rect {
  transition: fill 300ms;
}
rect:hover {
  fill: white;
}
</style>
