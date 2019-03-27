'use strict';

let router ;
let app ;
let wd = new WikiData() ;
let main_config ;
let evidence_codes ;

$(document).ready ( function () {
//	if ( window.location.hash=='' || window.location.hash=='#' ) return ;
	$('#app').show() ;
	$('#main_body').hide() ;
	vue_components.toolname = 'genedb' ;
	Promise.all ( [
		vue_components.loadComponents ( ['wd-link','wd-date','tool-translate','tool-navbar','publication','commons-thumbnail',
			'/wd/chromosome_plot.html',
			'/wd/gene_search_box.html',
			'/wd/genedb_header.html',
			'/wd/genedb_footer.html',
			'/wd/main_page.html',
			'/wd/index_page.html',
			'/wd/search_page.html',
			'/wd/gene_list.html',
			'/wd/gene.html',
			'/wd/evidence_claim.html',
//			'/wd/quicksearch.html',
			'/wd/species.html',
			'/wd/named_link.html',
			'/wd/go_list.html',
			'/wd/go_term.html',
			'/wd/part.html',
			'/wd/chromosome.html',
			'/wd/protein_box.html'
		] ) ,
		new Promise(function(resolve, reject) {
			$.get("data/datasets.json", function( data ){ 
				main_config = data ;
				resolve();
			} ) .fail(reject) ;
		} ) ,
		new Promise(
			function(resolve, reject) { // Global load of evidence codes
				if ( typeof evidence_codes != 'undefined' ) return resolve() ; // Already loaded
				evidence_codes = {} ;
				let sparql = 'SELECT ?q ?desc { ?q wdt:P31 wd:Q23173209 ; skos:altLabel ?desc FILTER ( LANG(?desc)="en" ) }' ;
				wd.loadSPARQL ( sparql , function ( d ) {
					$.each ( d.results.bindings , function ( dummy , b ) {
						let q = wd.itemFromBinding ( b.q ) ;
						let desc = b.desc.value ;
						if ( desc == 'evidence used in automatic assertion' ) return ;
						if ( typeof evidence_codes[q] == 'undefined' ) evidence_codes[q] = desc ;
					} ) ;
					resolve() ;
				} , reject ) ;
			} 

			),
//		new Promise(function(resolve, reject) { resolve() } )
	] )	.then ( () => {
			wd_link_wd = wd ;
			const routes = [
			  { path: '', component: IndexPage , props:true },
			  { path: '/', component: IndexPage , props:true },
			  { path: '/wd', component: MainPage , props:true },
			  { path: '/gene/:genedb_id', component: Gene , props:true },
			  { path: '/go/:go_term', component: GoTerm , props:true },
			  { path: '/search', component: SearchPage , props:true },
			  { path: '/search/:query', component: SearchPage , props:true },
			  { path: '/part/:id', component: PartPage , props:true },
//			  { path: '/quicksearch/', component: QuickSearch , props:true },
			  { path: '/species/:species_id', component: SpeciesPage , props:true },
			  { path: '/chromosome/:q_chromosome', component: Chromosome , props:true },
			] ;
			router = new VueRouter({routes}) ; // mode: 'history',
			app = new Vue ( { router } ) .$mount('#app') ;
		} ) ;
} ) ;
