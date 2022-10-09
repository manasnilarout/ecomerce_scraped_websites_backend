import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('websites_data')
export class WebsitesData {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column({ name: 'uri' })
    public uri: string;

    @Column({ name: 'suitecommerce_tag' })
    public suiteCommerceTag: string;

    @Column({ name: 'prodbundle_id' })
    public prodBundleId: string;

    @Column({ name: 'base_label' })
    public baseLabel: string;

    @Column({ name: 'version' })
    public version: string;

    @Column({ name: 'date_label' })
    public dateLabel: string;

    @Column({ name: 'build_no' })
    public buildNo: string;

    @Column({ name: 'company_id' })
    public companyId: string;

    @Column({ name: 'application_ld_json' })
    public applicationLdJson: string;

    @Column({ name: 'div_id_main' })
    public divIdMain: string;

    @Column({ name: 'div_class_main' })
    public divClassMain: string;

    @Column({ name: 'cookies' })
    public cookies: string;

    @Column({ name: 'canonical_url' })
    public canonicalUrl: string;

    @Column({ name: 'title' })
    public title: string;

    @Column({ name: 'seo_generator' })
    public seoGenerator: string;

    @Column({ name: 'got_response_from_pre_render' })
    public gotResponseFromPreRender: string;

    @Column({ name: 'got_response_from_pre_render_time' })
    public gotResponseFromPreRenderTime: string;

    @Column({ name: 'governance' })
    public governance: string;

    @Column({ name: 'perftiming' })
    public perfTiming: string;

    @Column({ name: 'perftiming_sqltime' })
    public perfTimingSqlTime: string;

    @Column({ name: 'search_request_details' })
    public searchRequestDetails: string;

    @Column({ name: 'ssp_app_context' })
    public SSPAppContext: string;

    @Column({ name: 'e_commerce_type' })
    public eCommerceType: string;

    @Column({ name: 'sub_request_status' })
    public subRequestStatus: string;

    @Column({ name: 'background_requests' })
    public backgroundRequests: string;

    @Column({ name: 'console_content' })
    public consoleContent: string;

    @Column({ name: 'is_cname_mapped' })
    public isCnameMapped: string;

    @Column({ name: 'cname_test_url' })
    public cNameTestUrl: string;

    @Column({ name: 'is_https' })
    public isHttps: string;

    @Column({ name: 'screen_capture' })
    public screenCapture: string;

    @Column({ name: 'url_input' })
    public urlInput: string;

    @Column({ name: 'date_scraped', type: 'date' })
    dateScraped: string;

    @Column({ name: 'source' })
    public source: string;

    @Column({ name: 'is_robots_page_present' })
    public isRobotsPagePresent: string;

    @Column({ name: 'is_sitemap_link_present_in_robots_page' })
    public isSitemapLinkPresentInRobotsPage: string;

    @Column({ name: 'sitemap_link' })
    public sitemapLink: string;

    @Column({ name: 'is_sitemap_link_functional' })
    public isSitemapLinkFunctional: string;

    @Column({ name: 'div_id_footer_tag' })
    public divIdFooterTag: string;

    @Column({ name: 'sitemap_origin' })
    public sitemapOrigin: string;

    @Column({ name: 'no_index_no_follow_tags' })
    public noIndexNoFollowTags: string;

    @Column({ name: 'robots_page_content' })
    public robotsPageContent: string;

    @Column({ name: 'is_google_analytics_loaded' })
    public isGoogleAnalyticsLoaded: string;

    @Column({ name: 'is_applicatin_ld_json_present' })
    public isApplicationLdJsonPresent: string;

    @Column({ name: 'schema_type' })
    public schemaType: string;

    @Column({ name: 'schema_markup_present' })
    public schemaMarkupPresent: string;

    @Column({ name: 'is_meta_description_present' })
    public isMetaDescriptionPresent: string;

    @Column({ name: 'got_response_from_pre_render_val_1' })
    public gotResponseFromPrerenderAttemptOne: string;

    @Column({ name: 'got_response_from_pre_render_val_2' })
    public gotResponseFromPrerenderAttemptTwo: string;

    @Column({ name: 'got_response_from_pre_render_val_3' })
    public gotResponseFromPrerenderAttemptThree: string;

    @Column({ name: 'got_response_from_pre_render_val_average' })
    public gotResponseFromPrerenderAttemptsAverage: string;

    @Column({ name: 'got_response_from_pre_render_val_alerts' })
    public gotResponseFromPrerenderAttemptsAlertLevelValues: string;
}
