import Button from '../Button';
import InputText from '../InputText'

export default function AddFieldForm(
  onCancel
) {
  return (
    <>
      <h4 className="text-white font-bold text-center mb-5">Add Field</h4>
      <InputText className="mb-5" placeholder="Label" />
      <InputText className="mb-5" placeholder="Value" />
      <div className="flex gap-5 justify-center">
        <Button className="w-24" label="Add Field" />
        <div onClick={onCancel}>Cancel</div>
        <Button click={onCancel} className="w-24" type="outline" label="Cancel" />
      </div>
    </>
  )
}