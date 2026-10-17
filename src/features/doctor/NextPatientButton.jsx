import { Button } from '../../components/ui'

export function NextPatientButton({ onClick, disabled, label = 'Next patient' }) {
  return (
    <Button variant="primary" onClick={onClick} disabled={disabled}>
      {label}
    </Button>
  )
}