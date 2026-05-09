import { useEffect, useRef } from 'react'
import * as echarts from 'echarts'
import PropTypes from 'prop-types'

SalesChart.propTypes = {
  filter: PropTypes.any,
  data: PropTypes.shape({
    labels: PropTypes.array,
    values: PropTypes.array
  })
}

export function SalesChart({ filter, data }) {
  const chartRef = useRef(null)
  const chartInstance = useRef(null)

  useEffect(() => {
    if (!chartRef.current) return

    // Init chart sekali saja
    if (!chartInstance.current) {
      chartInstance.current = echarts.init(chartRef.current)
    }

    const chart = chartInstance.current

    const option = {
      backgroundColor: 'transparent',

      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'line'
        },
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        borderRadius: 12,
        textStyle: {
          color: '#fff',
          fontSize: 12
        },
        formatter: (params) => {
          const item = params?.[0]

          return `
            <div class="p-2">
              <p class="font-semibold">${item?.axisValue ?? '-'}</p>
              <p class="text-emerald-400">
                Revenue: Rp ${(item?.value ?? 0).toLocaleString('id-ID')}
              </p>
            </div>
          `
        }
      },

      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },

      xAxis: {
        type: 'category',
        data: data?.labels ?? [],
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: {
          color: 'rgba(255,255,255,0.4)',
          fontSize: 11,
          fontWeight: 500
        }
      },

      yAxis: {
        type: 'value',
        axisLine: { show: false },
        axisTick: { show: false },

        splitLine: {
          lineStyle: {
            color: 'rgba(255,255,255,0.05)',
            type: 'dashed'
          }
        },

        axisLabel: {
          color: 'rgba(255,255,255,0.4)',
          fontSize: 11,
          formatter: (value) => `Rp ${(value / 1000).toFixed(0)}k`
        }
      },

      series: [
        {
          data: data?.values ?? [],
          type: 'line',
          smooth: true,

          symbol: 'circle',
          symbolSize: 6,

          lineStyle: {
            width: 3,
            color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
              { offset: 0, color: '#10b981' },
              { offset: 1, color: '#3b82f6' }
            ]),
            shadowBlur: 20,
            shadowColor: 'rgba(16,185,129,0.3)'
          },

          areaStyle: {
            opacity: 0.1,
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#10b981' },
              { offset: 1, color: 'rgba(16,185,129,0)' }
            ])
          },

          itemStyle: {
            color: '#10b981',
            borderColor: '#fff',
            borderWidth: 2
          },

          emphasis: {
            scale: true
          }
        }
      ]
    }

    chart.setOption(option)

    const handleResize = () => {
      chart.resize()
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [data, filter])

  // Dispose chart saat unmount
  useEffect(() => {
    return () => {
      chartInstance.current?.dispose()
      chartInstance.current = null
    }
  }, [])

  return <div ref={chartRef} className="h-80 w-full" />
}
