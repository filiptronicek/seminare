import { useRouter } from 'next/router'
 
export default function Page() {
  const router = useRouter()
  return <p>Akce: {router.query.id}</p>
}