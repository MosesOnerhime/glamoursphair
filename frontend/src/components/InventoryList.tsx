import { useMemo, useState } from 'react'
import type { DragEvent, PointerEvent } from 'react'
import { HiArrowDown, HiArrowUp, HiPencil, HiSearch, HiSwitchVertical, HiTrash, HiX } from 'react-icons/hi'
import type { Product } from '../types'
import { HOME_PRODUCT_LIMIT, isCatalogProduct, isHomepageProduct } from '../lib/productPlacement.js'

interface InventoryListProps {
  products: Product[]
  busy: boolean
  placementSupported: boolean
  onPlacement: (product: Product, field: 'showOnHomepage' | 'showInCatalog', value: boolean) => void
  editingId: number | null
  draggedId: number | null
  hoveredId: number | null
  onEdit: (product: Product) => void
  onDelete: (id: number) => void
  onMove: (from: number, to: number) => void
  onPointerSort: (event: PointerEvent<HTMLButtonElement>, id: number) => void
  onDragStart: (event: DragEvent<HTMLDivElement>, id: number) => void
  onDragOver: (event: DragEvent<HTMLDivElement>, id: number) => void
  onDrop: (event: DragEvent<HTMLDivElement>, id: number) => void
  onDragEnd: () => void
  hoverClass: (id: number) => string
}

export default function InventoryList(props: InventoryListProps) {
  const [query, setQuery] = useState('')
  const [collection, setCollection] = useState('all')
  const group = (product: Product) => product.group?.trim() || 'Signature Collection'
  const collections = [...new Set(props.products.map(group))]
  const visible = useMemo(() => props.products.filter(product =>
    (collection === 'all' || group(product) === collection) &&
    `${product.name} ${product.description} ${group(product)} ${product.length ?? ''} ${product.fitting ?? ''}`.toLowerCase().includes(query.trim().toLowerCase())
  ), [collection, props.products, query])

  return (
    <div className="inventory-list">
      <div className="inventory-toolbar">
        <div className="inventory-search"><HiSearch size={18} aria-hidden="true" /><label className="sr-only" htmlFor="inventory-search">Search inventory</label><input id="inventory-search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search inventory" type="search" />{query && <button type="button" onClick={() => setQuery('')} aria-label="Clear inventory search"><HiX size={17} /></button>}</div>
        <label className="sr-only" htmlFor="inventory-collection">Inventory collection</label><select id="inventory-collection" value={collection} onChange={event => setCollection(event.target.value)}><option value="all">All collections</option>{collections.map(name => <option key={name}>{name}</option>)}</select>
      </div>
      <p className="inventory-result-count" role="status">{visible.length} of {props.products.length} products</p>
      <div className="inventory-scroll">
        {visible.map(product => {
          const index = props.products.findIndex(item => item.id === product.id)
          return <div key={product.id} data-admin-product-id={product.id} draggable={!props.busy}
            onDragStart={event => props.onDragStart(event, product.id)} onDragOver={event => props.onDragOver(event, product.id)} onDrop={event => props.onDrop(event, product.id)} onDragEnd={props.onDragEnd}
            className={`inventory-row ${props.editingId === product.id ? 'is-editing' : ''} ${props.draggedId === product.id ? 'is-dragging' : ''} ${props.hoveredId === product.id ? 'is-hovered' : ''} ${props.hoverClass(product.id)}`}>
            <button type="button" className="inventory-drag inventory-icon" onPointerDown={event => { if (!props.busy) props.onPointerSort(event, product.id) }} disabled={props.busy} aria-label={`Drag ${product.name} to sort`} title="Drag to sort"><HiSwitchVertical size={19} /></button>
            <img src={product.images?.[0] ?? product.image} alt="" width="56" height="70" loading="lazy" />
            <div className="inventory-row-info"><button type="button" onClick={() => props.onEdit(product)} disabled={props.busy} className="inventory-product-name">{product.name}</button><p className="inventory-row-price">{`\u20a6${product.price.toLocaleString('en-NG')}`}<span>{group(product)}</span></p><p className="inventory-row-specs">{[product.length, product.volume, product.fitting].filter(Boolean).join(' / ') || product.description}</p><div className="inventory-placement">
              <label title={`Homepage selection: maximum ${HOME_PRODUCT_LIMIT}`}><input type="checkbox" aria-label={`Show ${product.name} on homepage`} checked={isHomepageProduct(product)} disabled={props.busy || !props.placementSupported || props.editingId === product.id} onChange={event => props.onPlacement(product, 'showOnHomepage', event.target.checked)} />Homepage</label>
              <label><input type="checkbox" aria-label={`Show ${product.name} on full products page`} checked={isCatalogProduct(product)} disabled={props.busy || !props.placementSupported || props.editingId === product.id} onChange={event => props.onPlacement(product, 'showInCatalog', event.target.checked)} />Products page</label>
            </div></div>
            <div className="inventory-row-actions">
              <span className="inventory-position" aria-label={`Position ${index + 1}`}>{index + 1}</span>
              <button type="button" className="inventory-icon" disabled={props.busy || index === 0} onClick={() => props.onMove(product.id, props.products[index - 1].id)} aria-label={`Move ${product.name} up`} title="Move up"><HiArrowUp size={17} /></button>
              <button type="button" className="inventory-icon" disabled={props.busy || index === props.products.length - 1} onClick={() => props.onMove(product.id, props.products[index + 1].id)} aria-label={`Move ${product.name} down`} title="Move down"><HiArrowDown size={17} /></button>
              <button type="button" className="inventory-icon" disabled={props.busy} onClick={() => props.onEdit(product)} aria-label={`Edit ${product.name}`} title="Edit product"><HiPencil size={18} /></button>
              <button type="button" className="inventory-icon inventory-delete" disabled={props.busy} onClick={() => props.onDelete(product.id)} aria-label={`Delete ${product.name}`} title="Delete product"><HiTrash size={18} /></button>
            </div>
          </div>
        })}
        {visible.length === 0 && <div className="inventory-empty"><p>{props.products.length ? 'No matching products.' : 'Your inventory is empty.'}</p>{props.products.length > 0 && <button type="button" onClick={() => { setQuery(''); setCollection('all') }}>Clear search and collection</button>}</div>}
      </div>
    </div>
  )
}
