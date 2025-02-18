# Shipper

allows rate shopping and shipping through different couriers.

## TODO

- [x] add onboarding page
  - require basic info required to setup tenant / org and user account
- [ ] add dashboard page
- [ ] add base layout for dashboard
- [ ] add create shipment form
- [ ] integrate with UPS API for rating
  - use [authcode grant type](https://developer.ups.com/api/reference/oauth/authorization-code?loc=en_CA) auth for delegated rates
- [ ] integrate with UPS API for creating shipments
- [ ] update create shipment form to allow predefined origins and destinations
  - address should be categorized as origin, destination or both
- [ ] add plans page
- [ ] update onboarding page to require credit card info

### UPS rating instructions (manual)

- get the origin postal code prefix [zone data](https://www.ups.com/ca/en/support/shipping-support/shipping-costs-rates.page)
- find the row whose postal code range has destination postal code
- pick the zone number based on the service level required
- find the [rate data](https://www.ups.com/assets/resources/webcontent/en_CA/rate_guide_ca.pdf) to get rate based on billable weight.
  - see rate guide linked above for instructions to calculate billable weight
