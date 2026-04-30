import * as params from '@params';
import posthog from 'posthog-js'

if (params.posthogToken) {
    posthog.init(params.posthogToken, {
        api_host: 'https://us.i.posthog.com',
        defaults: '2026-01-30'
    })
}
