export default function Modal({
  children,
  onClickOutside
}) {
  return (
    <div className="bg-black/50 fixed inset-0 z-50">
      <div onClick={onClickOutside} className="absolute inset-0 z-40" style={{ backdropFilter: 'blur(7px)' }} />
      <div className="w-96 bg-gray-900 border border-gray-600 rounded-lg absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
        {children}
      </div>
    </div>
  )
}