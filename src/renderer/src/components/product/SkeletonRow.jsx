export function SkeletonRow() {
  return (
    <tr className="border-b border-white/4">
      {[...'123456'].map((_, i) => (
        <td key={i} className="px-5 py-4">
          <div
            className="h-3.5 bg-white/5 rounded-lg animate-pulse"
            style={{ width: `${60 + i * 8}%` }}
          />
        </td>
      ))}
    </tr>
  )
}
