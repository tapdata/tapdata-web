export default {
  async created() {
    const freeTier = await this.getFreeTier()
    if (freeTier) {
      await this.subscribe(freeTier)

      this.$message.success('免费用户已自动创建 15 天的全托管实例免费试用。')
    } else {
      this.$message.info('已有免费全托管实例')
    }
  },

  methods: {
    async getFreeTier() {
      const [priceList] = await this.$axios.get('api/tcm/orders/paid/price', {
        params: {
          productType: 'fullManagement'
        }
      })

      return priceList.paidPrice.find(item => item.price === 0)
    },

    async subscribe(freeTier) {
      const data = await this.$axios.post('api/tcm/orders/subscribeV2', {
        price: 0,
        subscribeType: 'one_time',
        platform: 'fullManagement',
        subscribeItems: [
          {
            priceId: freeTier.priceId,
            quantity: 1,
            productType: 'Engine',
            agentType: 'Cloud',
            provider: '',
            region: ''
          }
        ],
        email: this.$store.state.user.email
      })

      const guideData = {
        agentId: data?.subscribeItems?.[0].resourceId,
        subscribeId: data?.subscribe
      }

      this.$store.commit('setGuide', {
        ...guideData
      })

      this.$axios.post('api/tcm/user_guide', guideData)

      // this.agentId = data?.subscribeItems?.[0].resourceId
      // this.subscribe = data?.subscribe
      // this.subscribeId = data?.subscribe
      //
      // this.postGuide()
    }
  }
}