import { useEffect, useRef } from 'react'
import * as echarts from 'echarts'
import PropTypes from 'prop-types'

CategoryDonutChart.propTypes = {
  data: PropTypes.array
}

export function CategoryDonutChart({ data }) {
  const chartRef = useRef(null)

  useEffect(() => {
    if (chartRef.current) {
      const chart = echarts.init(chartRef.current)

      const option = {
        tooltip: {
          trigger: 'item',
          backgroundColor: 'rgba(15, 23, 42, 0.95)',
          borderColor: 'rgba(255, 255, 255, 0.1)',
          borderWidth: 1,
          borderRadius: 12,
          textStyle: { color: '#fff', fontSize: 12 },
          formatter: (params) => {
            return `
              <div class="p-2">
                <p class="font-semibold">${params.name}</p>
                <p class="text-emerald-400">${params.percent}% of total</p>
                <p class="text-white/60">${params.value} products</p>
              </div>
            `
          }
        },
        legend: {
          orient: 'vertical',
          left: 'left',
          textStyle: { color: 'rgba(255, 255, 255, 0.6)' },
          itemWidth: 10,
          itemHeight: 10,
          borderRadius: 5,
          formatter: (name) => {
            const item = data.find((d) => d.name === name)
            return `${name} (${item?.value || 0})`
          }
        },
        series: [
          {
            name: 'Categories',
            type: 'pie',
            radius: ['45%', '70%'],
            avoidLabelOverlap: false,
            itemStyle: {
              borderRadius: 10,
              borderColor: 'rgba(15, 23, 42, 0.8)',
              borderWidth: 2
            },
            label: {
              show: false
            },
            emphasis: {
              label: {
                show: true,
                color: '#fff',
                fontWeight: 'bold',
                fontSize: 14
              },
              scale: true,
              scaleSize: 10
            },
            data: data.map((item) => ({
              name: item.name,
              value: item.value,
              itemStyle: {
                color: item.color
              }
            })),
            animation: true,
            animationType: 'expansion',
            animationDuration: 1500,
            animationEasing: 'cubicOut'
          }
        ],
        graphic: [
          {
            type: 'text',
            left: 'center',
            top: 'center',
            style: {
              text: `${data.reduce((sum, d) => sum + d.value, 0)}`,
              fill: '#fff',
              fontSize: 24,
              fontWeight: 'bold'
            }
          },
          {
            type: 'text',
            left: 'center',
            top: 'center',
            style: {
              text: 'Total\nProducts',
              fill: 'rgba(255, 255, 255, 0.4)',
              fontSize: 10,
              lineHeight: 14
            },
            styleRich: true,
            y: '55%'
          }
        ],
        backgroundColor: 'transparent'
      }

      chart.setOption(option)

      const handleResize = () => chart.resize()
      window.addEventListener('resize', handleResize)

      return () => {
        window.removeEventListener('resize', handleResize)
        chart.dispose()
      }
    }
  }, [data])

  return <div ref={chartRef} className="w-full h-80" />
}
