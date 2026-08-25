import { useContext } from 'react'
import { ShopContext } from '../context/ShopContextValue'
import { Hero } from '../components/Hero/Hero'
import { Popular } from '../components/Popular/Popular'
import { Offer } from '../components/Offer/Offer'
import { Newcollections } from '../components/Newcollections/Newcollections'
import { NewsLetter } from '../components/NewsLetter/NewsLetter'
import { AiProductFinder } from '../components/AiProductFinder/AiProductFinder'
import { Loading } from '../components/Loading/Loading'
import './css/Shop.css'

export const Shop = () => {
  const { isProductsLoading, productsError, loadProducts } = useContext(ShopContext)

  if (isProductsLoading) {
    return <Loading />
  }

  if (productsError) {
    return (
      <section className="shop-load-error" role="alert">
        <p>{productsError}</p>
        <button type="button" onClick={loadProducts}>Try again</button>
      </section>
    )
  }

  return (
    <div>
      <Hero />
      <Popular />
      <Offer />
      <Newcollections />
      <AiProductFinder />
      <NewsLetter />
    </div>
  )
}
