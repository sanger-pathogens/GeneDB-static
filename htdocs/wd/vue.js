'use strict';

let router ;
let app ;
let wd = new WikiData() ;
let main_config ;

/*
To update, see Promise( // EVIDENCE CODES
*/
let evidence_codes = {"Q23173789":"Inferred from Experiment","Q23174122":"Inferred from Direct Assay","Q23174389":"Inferred from Physical Interaction","Q23174671":"Inferred from Mutant Phenotype","Q23174952":"Inferred from Genetic Interaction","Q23175251":"Inferred from Expression Pattern","Q23175558":"Inferred from Sequence or structural Similarity","Q23190637":"Inferred from Sequence Orthology","Q23190738":"Inferred from Sequence Alignment","Q23190825":"Inferred from Sequence Model","Q23190826":"Inferred from Genomic Context","Q23190827":"Inferred from Biological aspect of Ancestor","Q23190833":"Inferred from Biological aspect of Descendant","Q23190842":"Inferred from Key Residues","Q23190850":"Inferred from Rapid Divergence","Q23190852":"Inferred from Reviewed Computational Analysis","Q23190853":"Traceable Author Statement","Q23190854":"Non-traceable Author Statement","Q23190856":"Inferred by Curator","Q23190857":"No biological Data available","Q23190881":"Inferred from Electronic Annotation","Q60521293":"High Throughput Expression Pattern","Q60521899":"High Throughput Direct Assay"} ;

/*
To update, run:
SELECT ?q (count(?main_subject) AS ?cnt) {
  ?q wdt:P921 ?main_subject .
  ?main_subject wdt:P3382 []
  }
group by ?q
having (?cnt>50)
order by desc(?cnt)
*/
let ignore_publications = ["Q27972199","Q27860838","Q27972532","Q34367962","Q34010644","Q29620631","Q33425111","Q38669954","Q27972568","Q27972535","Q58091270","Q28250679","Q35652830","Q34062280","Q36178962","Q35191287","Q46259567","Q58742888","Q27974123","Q33354129","Q42150085","Q27349403","Q35579624","Q53683724","Q27972573","Q39302167","Q41876126","Q61486566","Q27684255","Q28538804","Q33927038","Q21184008","Q30039538","Q24792290","Q33589077","Q27972160","Q27972615","Q30039542","Q40687205","Q30832036","Q37098733","Q33833378","Q36375576","Q39352490","Q42649279","Q34148271","Q28258708","Q43018298","Q24797363","Q34511546","Q33349990","Q33864331","Q27860548","Q34946799","Q46170634","Q35829600","Q31020153","Q30042996","Q37391307","Q27974666","Q36804703","Q24815881","Q34371420","Q27972581","Q51963462","Q28488181","Q53130066","Q33402631","Q42573739","Q58914733","Q26823169","Q37764523","Q33524549","Q27972159","Q33858963","Q48078231","Q41935620","Q39501630","Q34966268","Q35034166","Q56346038","Q28478226","Q42413602","Q27974681","Q33426797","Q56557856","Q52374177","Q38188569","Q36570582","Q61487177","Q58749843","Q36777813","Q27972929","Q39383927","Q30039594","Q35608041","Q27972945","Q28476745","Q33479781","Q33725213","Q36596866","Q40265766","Q33421107","Q27976478","Q34046969","Q59729704","Q61485558","Q30038962","Q52319182","Q44149286","Q34499800","Q33738172","Q27976506","Q30039501","Q44376031","Q28473962","Q27973871","Q34392458","Q27972605","Q30046142","Q38314322","Q25257149","Q39709851","Q21559511","Q30038970","Q36051466","Q56356862","Q38870844","Q34151913","Q48056927","Q27972709","Q47808765","Q47133883","Q41609621","Q37434581","Q37258669","Q27972540","Q24658218","Q27972962","Q43111893","Q42964826","Q46839737","Q34232882","Q27973781","Q29393314","Q29618254","Q29618991","Q34257729","Q49552073","Q33946473","Q34360835","Q41254366","Q39134551","Q55325238","Q30039220","Q34687046","Q35560051","Q48218068","Q27972567","Q37590441","Q58719931","Q30493084","Q47635451","Q41810812","Q45253018","Q48020408","Q27972684","Q39983686","Q33342855","Q24811411","Q42912397","Q27973185","Q27974805","Q46242678","Q31017413","Q54978700","Q33553363","Q61486802","Q34637909","Q41840305","Q34388528","Q57372747","Q36061908","Q36963334","Q27972551","Q27972538","Q27972541","Q27972543","Q27972570","Q37410103","Q61489574","Q39330937","Q61504729","Q48081255","Q44710057","Q34297803","Q61761573","Q30039579","Q57666112","Q42615580","Q33232985","Q30488352","Q33517913","Q35264598","Q33369965","Q61487943","Q55066681","Q27972539","Q30039100","Q27972966","Q27972732","Q27972663","Q27324650","Q27972544","Q61716584"];



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
/*
		new Promise( // EVIDENCE CODES
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
*/
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
