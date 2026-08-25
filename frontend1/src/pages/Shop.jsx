import React from 'react'
import { Hero } from '../components/Hero/Hero'
import { Popular } from '../components/Popular/Popular'
import { Offer } from '../components/Offer/Offer'
import { Newcollections } from '../components/Newcollections/Newcollections'
import { NewsLetter } from '../components/NewsLetter/NewsLetter'
import { AiProductFinder } from '../components/AiProductFinder/AiProductFinder'
export const Shop = () => {
  return (
    <div>
      <Hero/>
     <Popular/>
     <Offer/>
     <Newcollections/>
     <AiProductFinder/>
     <NewsLetter/>
    </div>
  )
}
