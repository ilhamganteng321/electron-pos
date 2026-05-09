import { useEffect, useRef } from 'react'
import * as echarts from 'echarts'
import PropTypes from 'prop-types'

SparklineChart.propTypes = {
  data: PropTypes.array,
  color: PropTypes.array
}

export function SparklineChart({ data, color }) {
  const chartRef = useRef(null)

  useEffect(() => {
    if (chartRef.current && data.length > 0) {
      const chart = echarts.init(chartRef.current)

      const colorMap = {
        emerald: '#10b981',
        blue: '#3b82f6',
        orange: '#f97316',
        violet: '#8b5cf6'
      }

      const option = {
        grid: {
          show: false,
          left: 0,
          right: 0,
          top: 0,
          bottom: 0
        },
        xAxis: { show: false },
        yAxis: { show: false },
        series: [
          {
            data: data,
            type: 'line',
            smooth: true,
            lineStyle: {
              width: 2,
              color: colorMap[color]
            },
            showSymbol: false,
            areaStyle: {
              opacity: 0.2,
              color: colorMap[color]
            }
          }
        ],
        tooltip: { show: false },
        backgroundColor: 'transparent'
      }

      chart.setOption(option)

      return () => chart.dispose()
    }
  }, [data, color])

  return <div ref={chartRef} className="w-full h-full" />
}
