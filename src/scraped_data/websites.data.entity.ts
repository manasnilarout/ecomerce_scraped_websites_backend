import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('websites_data')
export class WebsitesData {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    uri: string;

    @Column({ name: 'suitecommerce_tag' })
    suiteCommerceTag: string;

    @Column({ name: 'prodbundle_id' })
    prodBundleId: string;

    @Column({ name: 'base_label' })
    baseLabel: string;

    @Column({ name: 'version' })
    version: string;

    @Column({ name: 'date_label' })
    dateLabel: string;

    @Column({ name: 'build_no' })
    buildNo: string;

    @Column({ name: 'company_id' })
    companyId: string;

    @Column({ name: 'application_ld_json' })
    applicationLdJson: string;

    @Column({ name: 'div_id_main' })
    divIdMain: string;

    @Column({ name: 'div_class_main' })
    divClassMain: string;

    @Column({ name: 'cookies' })
    cookies: string;

    @Column({ name: 'canonical_url' })
    canonicalUrl: string;

    @Column({ name: 'title' })
    title: string;

    @Column({ name: 'seo_generator' })
    seoGenerator: string;

    @Column({ name: 'got_response_from_pre_render' })
    gotResponseFromPreRender: string;

    @Column({ name: 'governance' })
    governance: string;

    @Column({ name: 'perftiming' })
    perfTiming: string;

    @Column({ name: 'perftiming_sqltime' })
    perfTimingSqlTime: string;

    @Column({ name: 'search_request_details' })
    searchRequestDetails: string;

    @Column({ name: 'ssp_app_context' })
    SSPAppContext: string;

    @Column({ name: 'e_commerce_type' })
    eCommerceType: string;

    @Column({ name: 'sub_request_status' })
    subRequestStatus: string;

    @Column({ name: 'background_requests' })
    backgroundRequests: string;

    @Column({ name: 'console_content' })
    consoleContent: string;

    @Column({ name: 'is_cname_mapped' })
    isCnameMapped: string;

    @Column({ name: 'cname_test_url' })
    cNameTestUrl: string;

    @Column({ name: 'is_https' })
    isHttps: string;

    @Column({ name: 'screen_capture' })
    screenCapture: string;

    @Column({ name: 'url_input' })
    urlInput: string;

    @Column({ name: 'date_scraped', type: 'date' })
    dateScraped: string;

    @Column({ name: 'source' })
    source: string;

    @Column({ name: 'is_robots_page_present' })
    isRobotsPagePresent: string;

    @Column({ name: 'is_sitemap_link_present_in_robots_page' })
    isSitemapLinkPresentInRobotsPage: string;

    @Column({ name: 'sitemap_link' })
    sitemapLink: string;

    @Column({ name: 'is_sitemap_link_functional' })
    isSitemapLinkFunctional: string;
}